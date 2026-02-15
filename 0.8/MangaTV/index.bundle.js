(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.Sources = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MangaTV = exports.MangaTVInfo = void 0;

// Inline types from @paperback/types
const ContentRating = {
    EVERYONE: "EVERYONE",
    MATURE: "MATURE",
    ADULT: "ADULT"
};

const HomeSectionType = {
    singleRowNormal: "singleRowNormal",
    singleRowLarge: "singleRowLarge",
    doubleRow: "doubleRow",
    featured: "featured"
};

class Source {
    constructor(cheerio) {
        this.cheerio = cheerio;
    }
    searchRequest(query, metadata) {
        return this.getSearchResults(query, metadata);
    }
    async getTags() {
        return this.getSearchTags?.();
    }
}

const MANGATV_DOMAIN = "https://mangatv.net";

// Source Info
exports.MangaTVInfo = {
    version: '1.0.0',
    name: 'MangaTV',
    icon: 'icon.png',
    author: 'WiLyDTG',
    authorWebsite: 'https://github.com/WiLyDTG',
    description: 'Extension para leer manga desde mangatv.net',
    contentRating: ContentRating.MATURE,
    websiteBaseURL: MANGATV_DOMAIN,
    sourceTags: [
        { text: 'Spanish', type: 'info' },
        { text: 'Manga', type: 'success' }
    ],
    intents: 21
};

// Source Class
class MangaTV extends Source {
    constructor() {
        super(...arguments);
        this.requestManager = createRequestManager({
            requestsPerSecond: 3,
            requestTimeout: 15000,
            interceptor: {
                interceptRequest: async (request) => {
                    request.headers = {
                        ...(request.headers ?? {}),
                        "Referer": MANGATV_DOMAIN,
                        "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1"
                    };
                    return request;
                },
                interceptResponse: async (response) => {
                    return response;
                },
            },
        });
    }

    getMangaShareUrl(mangaId) {
        return `${MANGATV_DOMAIN}/manga/${mangaId}`;
    }

    async getMangaDetails(mangaId) {
        const request = createRequestObject({
            url: `${MANGATV_DOMAIN}/manga/${mangaId}`,
            method: "GET"
        });
        const response = await this.requestManager.schedule(request, 1);
        const $ = this.cheerio.load(response.data);

        const title = $('h1.text-2xl').first().text().trim() || $('h1').first().text().trim() || 'Sin título';
        const image = $('img[alt*="cover"], img[alt*="portada"], .cover img, article img').first().attr('src') || '';
        const desc = $('p.text-sm.text-gray-300, .description, .sinopsis').first().text().trim() || '';
        const author = $('span:contains("Autor") + span, a[href*="autor"]').first().text().trim() || 'Desconocido';
        const artist = $('span:contains("Artista") + span, a[href*="artista"]').first().text().trim() || '';

        let status = 0;
        const statusText = $('span:contains("Estado") + span, .status').first().text().toLowerCase();
        if (statusText.includes('finalizado') || statusText.includes('completado')) {
            status = 1;
        } else if (statusText.includes('pausado') || statusText.includes('hiatus')) {
            status = 2;
        }

        const tags = [];
        $('a[href*="genero"], a[href*="categoria"], .genres a, .tags a').each((_, el) => {
            const label = $(el).text().trim();
            if (label) {
                tags.push(createTag({ id: label.toLowerCase(), label: label }));
            }
        });
        const tagSections = tags.length > 0 ? [createTagSection({ id: '0', label: 'Géneros', tags })] : [];

        return createManga({
            id: mangaId,
            titles: [title],
            image: image,
            rating: 0,
            status: status,
            author: author,
            artist: artist,
            desc: desc,
            tags: tagSections
        });
    }

    async getChapters(mangaId) {
        const request = createRequestObject({
            url: `${MANGATV_DOMAIN}/manga/${mangaId}`,
            method: "GET"
        });
        const response = await this.requestManager.schedule(request, 1);
        const $ = this.cheerio.load(response.data);
        const chapters = [];

        $('a[href*="/leer/"]').each((index, el) => {
            const href = $(el).attr('href') || '';
            const chapterIdMatch = href.match(/\/leer\/([^\/]+)/);
            if (!chapterIdMatch) return;

            const chapterId = chapterIdMatch[1];
            const chapterText = $(el).text().trim();
            const chapNumMatch = chapterText.match(/cap[íi]tulo\s*(\d+(?:\.\d+)?)/i) || chapterText.match(/(\d+(?:\.\d+)?)/);
            const chapNum = chapNumMatch ? parseFloat(chapNumMatch[1]) : index + 1;

            chapters.push(createChapter({
                id: chapterId,
                mangaId: mangaId,
                name: chapterText || `Capítulo ${chapNum}`,
                chapNum: chapNum,
                time: new Date(),
                langCode: "🇪🇸"
            }));
        });

        return chapters.reverse();
    }

    async getChapterDetails(mangaId, chapterId) {
        const request = createRequestObject({
            url: `${MANGATV_DOMAIN}/leer/${chapterId}`,
            method: "GET"
        });
        const response = await this.requestManager.schedule(request, 1);
        const $ = this.cheerio.load(response.data);
        const pages = [];

        $('img[src*="img"], img[data-src*="img"], .reader img, .chapter-images img, picture img').each((_, el) => {
            let src = $(el).attr('data-src') || $(el).attr('src') || '';
            if (src && (src.includes('img') || src.includes('mangatv'))) {
                if (!src.startsWith('http')) {
                    src = src.startsWith('//') ? `https:${src}` : `${MANGATV_DOMAIN}${src}`;
                }
                if (!pages.includes(src)) {
                    pages.push(src);
                }
            }
        });

        return createChapterDetails({
            id: chapterId,
            mangaId: mangaId,
            pages: pages
        });
    }

    async getSearchResults(query, metadata) {
        const page = metadata?.page ?? 1;
        const searchUrl = query.title 
            ? `${MANGATV_DOMAIN}/?s=${encodeURIComponent(query.title)}&post_type=wp-manga&paged=${page}`
            : `${MANGATV_DOMAIN}/page/${page}/`;

        const request = createRequestObject({
            url: searchUrl,
            method: "GET"
        });
        const response = await this.requestManager.schedule(request, 1);
        const $ = this.cheerio.load(response.data);
        const results = [];

        $('article, .manga-item, .post-item, a[href*="/manga/"]').each((_, el) => {
            const linkEl = $(el).is('a') ? $(el) : $(el).find('a[href*="/manga/"]').first();
            const href = linkEl.attr('href') || '';
            const idMatch = href.match(/\/manga\/(\d+\/[^\/]+)/);
            if (!idMatch) return;

            const id = idMatch[1];
            const title = $(el).find('h2, h3, .title, .name').first().text().trim() || linkEl.text().trim();
            const image = $(el).find('img').first().attr('src') || $(el).find('img').first().attr('data-src') || '';

            if (id && title) {
                results.push(createMangaTile({
                    id: id,
                    title: createIconText({ text: title }),
                    image: image
                }));
            }
        });

        const hasNext = $('a.next, .pagination a:contains("Siguiente"), a[rel="next"]').length > 0;
        return createPagedResults({
            results: results,
            metadata: hasNext ? { page: page + 1 } : undefined
        });
    }

    async getHomePageSections(sectionCallback) {
        const latestSection = createHomeSection({
            id: 'latest',
            title: 'Últimas Actualizaciones',
            type: HomeSectionType.singleRowNormal,
            view_more: true
        });
        sectionCallback(latestSection);

        const request = createRequestObject({
            url: MANGATV_DOMAIN,
            method: "GET"
        });
        const response = await this.requestManager.schedule(request, 1);
        const $ = this.cheerio.load(response.data);

        const latestTiles = [];
        $('article, .manga-item, a[href*="/manga/"]').slice(0, 20).each((_, el) => {
            const linkEl = $(el).is('a') ? $(el) : $(el).find('a[href*="/manga/"]').first();
            const href = linkEl.attr('href') || '';
            const idMatch = href.match(/\/manga\/(\d+\/[^\/]+)/);
            if (!idMatch) return;

            const id = idMatch[1];
            const title = $(el).find('h2, h3, .title').first().text().trim() || linkEl.text().trim();
            const image = $(el).find('img').first().attr('src') || '';

            if (id && title) {
                latestTiles.push(createMangaTile({
                    id: id,
                    title: createIconText({ text: title }),
                    image: image
                }));
            }
        });

        latestSection.items = latestTiles;
        sectionCallback(latestSection);
    }

    async getViewMoreItems(homepageSectionId, metadata) {
        const page = metadata?.page ?? 1;
        const request = createRequestObject({
            url: `${MANGATV_DOMAIN}/page/${page}/`,
            method: "GET"
        });
        const response = await this.requestManager.schedule(request, 1);
        const $ = this.cheerio.load(response.data);
        const results = [];

        $('article, .manga-item, a[href*="/manga/"]').each((_, el) => {
            const linkEl = $(el).is('a') ? $(el) : $(el).find('a[href*="/manga/"]').first();
            const href = linkEl.attr('href') || '';
            const idMatch = href.match(/\/manga\/(\d+\/[^\/]+)/);
            if (!idMatch) return;

            const id = idMatch[1];
            const title = $(el).find('h2, h3, .title').first().text().trim() || linkEl.text().trim();
            const image = $(el).find('img').first().attr('src') || '';

            if (id && title) {
                results.push(createMangaTile({
                    id: id,
                    title: createIconText({ text: title }),
                    image: image
                }));
            }
        });

        const hasNext = $('a.next, .pagination a:contains("Siguiente")').length > 0;
        return createPagedResults({
            results: results,
            metadata: hasNext ? { page: page + 1 } : undefined
        });
    }

    getCloudflareBypassRequest() {
        return createRequestObject({
            url: MANGATV_DOMAIN,
            method: "GET"
        });
    }
}
exports.MangaTV = MangaTV;

},{}]},{},[1])(1)
});
