// source.js for MangaTV.net extension
// Based on observed HTML of the site. This bundle is a simplified
// implementation meant to demonstrate the scraping logic; you may
// need to adjust selectors or add Cloudflare handling if the site
// deploys protections.

(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!="undefined"){g=window}else if(typeof global!="undefined"){g=global}else if(typeof self!="undefined"){g=self}else{g=this}g.Sources=f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({
1:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MangaTV = exports.info = void 0;
const types_1 = require("@paperback/types");
const cheerio = require("cheerio");
const BASE_URL = "https://mangatv.net";
const USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";

exports.info = {
    version: '1.0.0',
    name: 'MangaTV',
    icon: 'icon.png',
    author: 'Generated',
    description: 'Extension for mangatv.net',
    contentRating: types_1.ContentRating.MATURE,
    websiteBaseURL: BASE_URL,
    intents: types_1.SourceIntents.MANGA_CHAPTERS | types_1.SourceIntents.HOMEPAGE_SECTIONS
};

class MangaTV extends types_1.Source {
    constructor() {
        super(...arguments);
        this.requestManager = createRequestManager({
            requestsPerSecond: 2,
            requestTimeout: 20000,
            interceptor: {
                interceptRequest: async (request) => {
                    request.headers = {
                        ...(request.headers ?? {}),
                        "Referer": `${BASE_URL}/`,
                        "Origin": BASE_URL,
                        "User-Agent": USER_AGENT,
                    };
                    return request;
                },
                interceptResponse: async (response) => response,
            },
        });
    }

    parseHomeSection($, baseUrl) {
        const tiles = [];
        $('div.listupd div.bsx').each((i, elem) => {
            const a = $('a', elem).first();
            const href = a.attr('href') || '';
            const mangaId = href.split('/').slice(-2, -1)[0];
            const title = $('div.bigor div.tt', elem).text().trim();
            const image = $('img', elem).attr('src') || '';
            if (mangaId && title) {
                tiles.push(createMangaTile({
                    id: mangaId,
                    title: createIconText({ text: title }),
                    image: image.startsWith('//') ? 'https:' + image : image
                }));
            }
        });
        return tiles;
    }

    async getMangaDetails(mangaId) {
        const url = `${BASE_URL}/manga/${mangaId}`;
        const request = createRequestObject({ url, method: "GET" });
        const response = await this.requestManager.schedule(request, 1);
        const $ = cheerio.load(response.data);
        const title = $('h1.entry-title').text().trim();
        const image = $('div.thumb img').attr('src') || '';
        const desc = $('div.wd-full:contains("Sinopsis") span').text().trim();
        const tags = [];
        $('div.wd-full:contains("Generos") a').each((i, el) => {
            const label = $(el).text().trim();
            if (label) tags.push(createTag({ id: label, label, type: 'default' }));
        });
        const tagSections = [createTagSection({ id: '0', label: 'Géneros', tags })];
        let status = types_1.MangaStatus.ONGOING;
        const statusText = $('div.tsinfo .imptdt').first().text().toLowerCase();
        if (statusText.includes('public') || statusText.includes('finalizado')) {
            status = types_1.MangaStatus.COMPLETED;
        }
        return createManga({
            id: mangaId,
            titles: [title],
            image: image.startsWith('//') ? 'https:' + image : image,
            desc: desc,
            status,
            tags: tagSections,
        });
    }

    async getChapters(mangaId) {
        const url = `${BASE_URL}/manga/${mangaId}`;
        const req = createRequestObject({ url, method: 'GET' });
        const res = await this.requestManager.schedule(req, 1);
        const $ = cheerio.load(res.data);
        const chapters = [];
        $('ul.clstyle li').each((i, elem) => {
            const row = $(elem);
            const link = row.find('a.dload').attr('href') || '';
            const chapId = link.split('/').pop();
            const chapNumText = row.find('.eph-num .chapternum').first().text();
            const chapNumMatch = chapNumText.match(/(\d+(?:\.\d+)?)/);
            const chapNum = chapNumMatch ? parseFloat(chapNumMatch[1]) : 0;
            const timeText = row.find('.chapterdate').text();
            const time = timeText ? new Date(timeText) : new Date();
            chapters.push(createChapter({
                id: chapId,
                mangaId,
                name: chapNumText,
                chapNum,
                time,
                langCode: 'es'
            }));
        });
        return chapters;
    }

    async getChapterDetails(mangaId, chapterId) {
        const url = `${BASE_URL}/leer/${chapterId}`;
        const req = createRequestObject({ url, method: 'GET' });
        const res = await this.requestManager.schedule(req, 1);
        const $ = cheerio.load(res.data);
        // The page builds the list of images using an obfuscated eval script.
        // We extract all base64 strings from that script and decode them.
        const scriptText = res.data.match(/eval\(function\(p,a,c,k,e,d\)[\s\S]*?\)\);/);
        const pages = [];
        if (scriptText) {
            // grab all base64-like tokens inside the script
            const b64s = [...scriptText[0].matchAll(/['"]([A-Za-z0-9+/=]{4,}?)['"]/g)].map(m=>m[1]);
            for (const b of b64s) {
                try {
                    const decoded = Buffer.from(b, 'base64').toString();
                    if (decoded.startsWith('http')) {
                        pages.push(decoded);
                    }
                }
                catch (_e) { }
            }
        }
        return createChapterDetails({ id: chapterId, mangaId, pages });
    }

    async searchRequest(query, metadata) {
        const term = encodeURIComponent(query.title || "");
        return createRequestObject({
            url: `${BASE_URL}/lista?s=${term}`,
            method: 'GET'
        });
    }

    async getSearchResults(query, metadata) {
        const response = await this.requestManager.schedule(await this.searchRequest(query, metadata), 1);
        const $ = cheerio.load(response.data);
        const tiles = this.parseHomeSection($, BASE_URL);
        return createPagedResults({ results: tiles });
    }

    async getHomePageSections(sectionCallback) {
        const url = `${BASE_URL}`;
        const req = createRequestObject({ url, method: 'GET' });
        const res = await this.requestManager.schedule(req, 1);
        const $ = cheerio.load(res.data);
        const section = createHomeSection({
            id: 'latest',
            title: 'Últimos añadidos',
            type: types_1.HomeSectionType.singleRowNormal
        });
        section.items = this.parseHomeSection($, BASE_URL).slice(0, 20);
        sectionCallback(section);
    }

    async getViewMoreItems(homepageSectionId, metadata) {
        return createPagedResults({ results: [] });
    }
}
exports.MangaTV = MangaTV;

},{"@paperback/types":61,"cheerio":74}]},{},[1])(1)
});
