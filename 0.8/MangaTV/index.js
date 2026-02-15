// MangaTV Extension for Paperback 0.8
// Standalone bundle with inline types (following FeliiCL pattern)

(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.Sources = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({

// Module 1: BadgeColor enum
1:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BadgeColor = void 0;
var BadgeColor;
(function (BadgeColor) {
    BadgeColor["BLUE"] = "default";
    BadgeColor["GREEN"] = "success";
    BadgeColor["GREY"] = "info";
    BadgeColor["YELLOW"] = "warning";
    BadgeColor["RED"] = "danger";
})(BadgeColor = exports.BadgeColor || (exports.BadgeColor = {}));
},{}],

// Module 2: ByteArray (empty)
2:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
},{}],

// Module 3: HomeSectionType enum
3:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HomeSectionType = void 0;
var HomeSectionType;
(function (HomeSectionType) {
    HomeSectionType["singleRowNormal"] = "singleRowNormal";
    HomeSectionType["singleRowLarge"] = "singleRowLarge";
    HomeSectionType["doubleRow"] = "doubleRow";
    HomeSectionType["featured"] = "featured";
})(HomeSectionType = exports.HomeSectionType || (exports.HomeSectionType = {}));
},{}],

// Module 4: PaperbackExtensionBase (empty)
4:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
},{}],

// Module 5: Source class
5:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.urlEncodeObject = exports.convertTime = exports.Source = void 0;
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
exports.Source = Source;
function convertTime(timeAgo) {
    let time;
    let trimmed = Number((/\d*/.exec(timeAgo) ?? [])[0]);
    trimmed = (trimmed == 0 && timeAgo.includes('a')) ? 1 : trimmed;
    if (timeAgo.includes('minutes')) {
        time = new Date(Date.now() - trimmed * 60000);
    } else if (timeAgo.includes('hours')) {
        time = new Date(Date.now() - trimmed * 3600000);
    } else if (timeAgo.includes('days')) {
        time = new Date(Date.now() - trimmed * 86400000);
    } else if (timeAgo.includes('year') || timeAgo.includes('years')) {
        time = new Date(Date.now() - trimmed * 31556952000);
    } else {
        time = new Date(Date.now());
    }
    return time;
}
exports.convertTime = convertTime;
function urlEncodeObject(obj) {
    let ret = {};
    for (const entry of Object.entries(obj)) {
        ret[encodeURIComponent(entry[0])] = encodeURIComponent(entry[1]);
    }
    return ret;
}
exports.urlEncodeObject = urlEncodeObject;
},{}],

// Module 6: SourceInfo (ContentRating & SourceIntents enums)
6:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContentRating = exports.SourceIntents = void 0;
var SourceIntents;
(function (SourceIntents) {
    SourceIntents[SourceIntents["MANGA_CHAPTERS"] = 1] = "MANGA_CHAPTERS";
    SourceIntents[SourceIntents["MANGA_TRACKING"] = 2] = "MANGA_TRACKING";
    SourceIntents[SourceIntents["HOMEPAGE_SECTIONS"] = 4] = "HOMEPAGE_SECTIONS";
    SourceIntents[SourceIntents["COLLECTION_MANAGEMENT"] = 8] = "COLLECTION_MANAGEMENT";
    SourceIntents[SourceIntents["CLOUDFLARE_BYPASS_REQUIRED"] = 16] = "CLOUDFLARE_BYPASS_REQUIRED";
    SourceIntents[SourceIntents["SETTINGS_UI"] = 32] = "SETTINGS_UI";
})(SourceIntents = exports.SourceIntents || (exports.SourceIntents = {}));
var ContentRating;
(function (ContentRating) {
    ContentRating["EVERYONE"] = "EVERYONE";
    ContentRating["MATURE"] = "MATURE";
    ContentRating["ADULT"] = "ADULT";
})(ContentRating = exports.ContentRating || (exports.ContentRating = {}));
},{}],

// Module 7: base/index (re-exports)
7:[function(require,module,exports){
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
__exportStar(require("./Source"), exports);
__exportStar(require("./ByteArray"), exports);
__exportStar(require("./Badge"), exports);
__exportStar(require("./SourceInfo"), exports);
__exportStar(require("./HomeSectionType"), exports);
__exportStar(require("./PaperbackExtensionBase"), exports);
},{"./Badge":1,"./ByteArray":2,"./HomeSectionType":3,"./PaperbackExtensionBase":4,"./Source":5,"./SourceInfo":6}],

// Modules 8-15: Empty interface modules
8:[function(require,module,exports){"use strict";Object.defineProperty(exports, "__esModule", { value: true });},{}],
9:[function(require,module,exports){"use strict";Object.defineProperty(exports, "__esModule", { value: true });},{}],
10:[function(require,module,exports){"use strict";Object.defineProperty(exports, "__esModule", { value: true });},{}],
11:[function(require,module,exports){"use strict";Object.defineProperty(exports, "__esModule", { value: true });},{}],
12:[function(require,module,exports){"use strict";Object.defineProperty(exports, "__esModule", { value: true });},{}],
13:[function(require,module,exports){"use strict";Object.defineProperty(exports, "__esModule", { value: true });},{}],
14:[function(require,module,exports){"use strict";Object.defineProperty(exports, "__esModule", { value: true });},{}],

// Module 15: interfaces index
15:[function(require,module,exports){
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
__exportStar(require("./ChapterProviding"), exports);
__exportStar(require("./HomePageSectionsProviding"), exports);
__exportStar(require("./MangaProviding"), exports);
__exportStar(require("./RequestManagerProviding"), exports);
__exportStar(require("./SearchResultsProviding"), exports);
},{"./ChapterProviding":8,"./HomePageSectionsProviding":9,"./MangaProviding":10,"./RequestManagerProviding":11,"./SearchResultsProviding":12}],

// Modules 16-59: Empty DynamicUI and Exports modules
16:[function(require,module,exports){"use strict";Object.defineProperty(exports, "__esModule", { value: true });},{}],
17:[function(require,module,exports){"use strict";Object.defineProperty(exports, "__esModule", { value: true });},{}],
18:[function(require,module,exports){"use strict";Object.defineProperty(exports, "__esModule", { value: true });},{}],
19:[function(require,module,exports){"use strict";Object.defineProperty(exports, "__esModule", { value: true });},{}],
20:[function(require,module,exports){"use strict";Object.defineProperty(exports, "__esModule", { value: true });},{}],
21:[function(require,module,exports){"use strict";Object.defineProperty(exports, "__esModule", { value: true });},{}],
22:[function(require,module,exports){"use strict";Object.defineProperty(exports, "__esModule", { value: true });},{}],
23:[function(require,module,exports){"use strict";Object.defineProperty(exports, "__esModule", { value: true });},{}],
24:[function(require,module,exports){"use strict";Object.defineProperty(exports, "__esModule", { value: true });},{}],
25:[function(require,module,exports){"use strict";Object.defineProperty(exports, "__esModule", { value: true });},{}],
26:[function(require,module,exports){"use strict";Object.defineProperty(exports, "__esModule", { value: true });},{}],
27:[function(require,module,exports){"use strict";Object.defineProperty(exports, "__esModule", { value: true });},{}],
28:[function(require,module,exports){"use strict";Object.defineProperty(exports, "__esModule", { value: true });},{}],
29:[function(require,module,exports){"use strict";Object.defineProperty(exports, "__esModule", { value: true });},{}],
30:[function(require,module,exports){"use strict";Object.defineProperty(exports, "__esModule", { value: true });},{}],
31:[function(require,module,exports){"use strict";Object.defineProperty(exports, "__esModule", { value: true });},{}],
32:[function(require,module,exports){"use strict";Object.defineProperty(exports, "__esModule", { value: true });},{}],
33:[function(require,module,exports){"use strict";Object.defineProperty(exports, "__esModule", { value: true });},{}],
34:[function(require,module,exports){"use strict";Object.defineProperty(exports, "__esModule", { value: true });},{}],
35:[function(require,module,exports){"use strict";Object.defineProperty(exports, "__esModule", { value: true });},{}],
36:[function(require,module,exports){"use strict";Object.defineProperty(exports, "__esModule", { value: true });},{}],
37:[function(require,module,exports){"use strict";Object.defineProperty(exports, "__esModule", { value: true });},{}],
38:[function(require,module,exports){"use strict";Object.defineProperty(exports, "__esModule", { value: true });},{}],
39:[function(require,module,exports){"use strict";Object.defineProperty(exports, "__esModule", { value: true });},{}],
40:[function(require,module,exports){"use strict";Object.defineProperty(exports, "__esModule", { value: true });},{}],
41:[function(require,module,exports){"use strict";Object.defineProperty(exports, "__esModule", { value: true });},{}],
42:[function(require,module,exports){"use strict";Object.defineProperty(exports, "__esModule", { value: true });},{}],
43:[function(require,module,exports){"use strict";Object.defineProperty(exports, "__esModule", { value: true });},{}],
44:[function(require,module,exports){"use strict";Object.defineProperty(exports, "__esModule", { value: true });},{}],
45:[function(require,module,exports){"use strict";Object.defineProperty(exports, "__esModule", { value: true });},{}],
46:[function(require,module,exports){"use strict";Object.defineProperty(exports, "__esModule", { value: true });},{}],
47:[function(require,module,exports){"use strict";Object.defineProperty(exports, "__esModule", { value: true });},{}],
48:[function(require,module,exports){"use strict";Object.defineProperty(exports, "__esModule", { value: true });},{}],
49:[function(require,module,exports){"use strict";Object.defineProperty(exports, "__esModule", { value: true });},{}],
50:[function(require,module,exports){"use strict";Object.defineProperty(exports, "__esModule", { value: true });},{}],
51:[function(require,module,exports){"use strict";Object.defineProperty(exports, "__esModule", { value: true });},{}],
52:[function(require,module,exports){"use strict";Object.defineProperty(exports, "__esModule", { value: true });},{}],
53:[function(require,module,exports){"use strict";Object.defineProperty(exports, "__esModule", { value: true });},{}],
54:[function(require,module,exports){"use strict";Object.defineProperty(exports, "__esModule", { value: true });},{}],
55:[function(require,module,exports){"use strict";Object.defineProperty(exports, "__esModule", { value: true });},{}],
56:[function(require,module,exports){"use strict";Object.defineProperty(exports, "__esModule", { value: true });},{}],
57:[function(require,module,exports){"use strict";Object.defineProperty(exports, "__esModule", { value: true });},{}],
58:[function(require,module,exports){"use strict";Object.defineProperty(exports, "__esModule", { value: true });},{}],
59:[function(require,module,exports){"use strict";Object.defineProperty(exports, "__esModule", { value: true });},{}],

// Module 60: generated/_exports (re-exports all entity types)
60:[function(require,module,exports){
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
__exportStar(require("./DUIBinding"), exports);
__exportStar(require("./DUIForm"), exports);
__exportStar(require("./DUIFormRow"), exports);
__exportStar(require("./DUISection"), exports);
__exportStar(require("./Chapter"), exports);
__exportStar(require("./ChapterDetails"), exports);
__exportStar(require("./HomeSection"), exports);
__exportStar(require("./IconText"), exports);
__exportStar(require("./MangaInfo"), exports);
__exportStar(require("./PagedResults"), exports);
__exportStar(require("./Request"), exports);
__exportStar(require("./RequestManager"), exports);
__exportStar(require("./Response"), exports);
__exportStar(require("./SearchRequest"), exports);
__exportStar(require("./SourceManga"), exports);
__exportStar(require("./Tag"), exports);
__exportStar(require("./TagSection"), exports);
},{"./DUIBinding":17,"./DUIForm":18,"./DUIFormRow":19,"./DUISection":20,"./Chapter":33,"./ChapterDetails":34,"./HomeSection":36,"./IconText":37,"./MangaInfo":38,"./PagedResults":43,"./Request":46,"./RequestManager":47,"./Response":48,"./SearchRequest":50,"./SourceManga":54,"./Tag":56,"./TagSection":57}],

// Module 61: Main @paperback/types index
61:[function(require,module,exports){
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
__exportStar(require("./generated/_exports"), exports);
__exportStar(require("./base/index"), exports);
__exportStar(require("./compat/DyamicUI"), exports);
},{"./base/index":7,"./compat/DyamicUI":16,"./generated/_exports":60}],

// Module 62: MangaTV Extension
62:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MangaTV = void 0;
const types_1 = require("@paperback/types");

const BASE_URL = "https://mangatv.net";

// Base64 decode implementation (no atob dependency)
const BASE64_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
function decodeBase64(str) {
    try {
        // Pad the string if necessary
        let padded = str;
        while (padded.length % 4 !== 0) {
            padded += '=';
        }
        
        let output = '';
        for (let i = 0; i < padded.length; i += 4) {
            const enc1 = BASE64_CHARS.indexOf(padded.charAt(i));
            const enc2 = BASE64_CHARS.indexOf(padded.charAt(i + 1));
            const enc3 = BASE64_CHARS.indexOf(padded.charAt(i + 2));
            const enc4 = BASE64_CHARS.indexOf(padded.charAt(i + 3));
            
            const chr1 = (enc1 << 2) | (enc2 >> 4);
            const chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
            const chr3 = ((enc3 & 3) << 6) | enc4;
            
            output += String.fromCharCode(chr1);
            if (enc3 !== 64) output += String.fromCharCode(chr2);
            if (enc4 !== 64) output += String.fromCharCode(chr3);
        }
        return output;
    } catch (e) {
        return null;
    }
}

class MangaTV extends types_1.Source {
    constructor() {
        super(...arguments);
        this.requestManager = createRequestManager({
            requestsPerSecond: 3,
            requestTimeout: 20000,
            interceptor: {
                interceptRequest: async (request) => {
                    request.headers = {
                        ...(request.headers ?? {}),
                        "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1",
                        "Referer": `${BASE_URL}/`
                    };
                    return request;
                },
                interceptResponse: async (response) => response
            }
        });
    }

    async getMangaDetails(mangaId) {
        const request = createRequestObject({
            url: `${BASE_URL}/manga/${mangaId}`,
            method: "GET"
        });
        const response = await this.requestManager.schedule(request, 1);
        const $ = this.cheerio.load(response.data);

        // Title from entry-title or first h1
        const title = $('h1.entry-title').text().trim() || $('h1').first().text().trim() || "Sin título";
        
        // Image from thumb or ts-post-image
        let image = $('div.thumb img').attr('src') || $('img.ts-post-image').first().attr('src') || "";
        if (image.startsWith('//')) image = 'https:' + image;
        
        // Description from wd-full containing Sinopsis
        const desc = $('div.wd-full:contains("Sinopsis") span').text().trim() || 
                     $('div.entry-content p').text().trim() ||
                     "Sin descripción";
        
        let status = 0;
        const statusText = ($('div.imptdt:contains("Estado") i').text() || 
                          $('span.type').first().text() || "").toLowerCase();
        if (statusText.includes("finalizado") || statusText.includes("completado") || statusText.includes("completed")) {
            status = 1;
        } else if (statusText.includes("pausado") || statusText.includes("hiatus")) {
            status = 2;
        }

        // Author
        const author = $('div.imptdt:contains("Autor") i').text().trim() || 
                      $('span.author').text().trim() ||
                      "Desconocido";

        // Genres/Tags
        const tags = [];
        $('div.mgen a, a.genre').each((i, el) => {
            const label = $(el).text().trim();
            if (label) {
                tags.push(createTag({ id: label.toLowerCase(), label: label }));
            }
        });

        return createManga({
            id: mangaId,
            titles: [title],
            image: image,
            rating: 0,
            status: status,
            author: author,
            desc: desc,
            tags: [createTagSection({ id: '0', label: 'Géneros', tags: tags })]
        });
    }

    async getChapters(mangaId) {
        const request = createRequestObject({
            url: `${BASE_URL}/manga/${mangaId}`,
            method: "GET"
        });
        const response = await this.requestManager.schedule(request, 1);
        const $ = this.cheerio.load(response.data);

        const chapters = [];
        const seenChapNums = new Set();
        
        // MangaTV uses li with div.chbox containing the chapter links
        $('ul.clstyle li').each((i, el) => {
            const $el = $(el);
            const link = $el.find('a.dload').attr('href') || $el.find('div.dt a').attr('href') || "";
            
            if (!link) return;

            // Extract chapter ID from /leer/{chapterId}
            const chapterIdMatch = link.match(/\/leer\/([^\/\?]+)/i);
            const chapterId = chapterIdMatch ? chapterIdMatch[1] : "";
            
            if (!chapterId) return;

            // Get chapter number from chapternum span
            const chapterText = $el.find('span.chapternum').first().text().trim();
            const chapNumMatch = chapterText.match(/(\d+(?:\.\d+)?)/);
            const chapNum = chapNumMatch ? parseFloat(chapNumMatch[1]) : i + 1;

            // Skip duplicate chapter numbers (take only first translation)
            if (seenChapNums.has(chapNum)) return;
            seenChapNums.add(chapNum);

            // Get date
            const dateText = $el.find('span.chapterdate').text().trim();
            let time = new Date();
            if (dateText) {
                const parsed = Date.parse(dateText);
                if (!isNaN(parsed)) time = new Date(parsed);
            }

            chapters.push(createChapter({
                id: chapterId,
                mangaId: mangaId,
                name: `Capítulo ${chapNum}`,
                chapNum: chapNum,
                time: time,
                langCode: "🇪🇸"
            }));
        });

        return chapters;
    }

    async getChapterDetails(mangaId, chapterId) {
        const request = createRequestObject({
            url: `${BASE_URL}/leer/${chapterId}`,
            method: "GET"
        });
        const response = await this.requestManager.schedule(request, 1);
        const html = response.data;

        const pages = [];
        
        // MangaTV encodes images in base64 in the HTML
        // Pattern: atob|{base64_image1}|{base64_image2}|...
        const atobMatch = html.match(/atob\|([^"]+)"/);
        if (atobMatch) {
            const parts = atobMatch[1].split('|');
            for (const part of parts) {
                // Skip non-image parts (like variable names)
                if (part.length < 20) continue;
                
                const decoded = decodeBase64(part);
                if (decoded && (decoded.includes('mangatv.net') || decoded.includes('.webp') || decoded.includes('.jpg') || decoded.includes('.png'))) {
                    let url = decoded.trim();
                    if (url.startsWith('//')) url = 'https:' + url;
                    pages.push(url);
                }
            }
        }

        return createChapterDetails({
            id: chapterId,
            mangaId: mangaId,
            pages: pages
        });
    }

    async getSearchResults(query, metadata) {
        const page = metadata?.page ?? 1;
        const searchUrl = query.title 
            ? `${BASE_URL}/lista?s=${encodeURIComponent(query.title)}&page=${page}`
            : `${BASE_URL}/lista?page=${page}`;
        
        const request = createRequestObject({
            url: searchUrl,
            method: "GET"
        });
        const response = await this.requestManager.schedule(request, 1);
        const $ = this.cheerio.load(response.data);

        const tiles = [];
        // MangaTV uses div.bs.styletere > div.bsx > a for manga cards
        $('div.bs div.bsx a').each((i, el) => {
            const $el = $(el);
            const link = $el.attr('href') || "";
            const title = $el.find('div.tt').text().trim() || $el.attr('title') || "Sin título";
            let image = $el.find('img.ts-post-image').attr('src') || "";
            if (image.startsWith('//')) image = 'https:' + image;

            // Extract ID: /manga/{id}/{slug}
            const idMatch = link.match(/\/manga\/(\d+\/[^\/]+)/);
            const id = idMatch ? idMatch[1] : "";

            if (id) {
                tiles.push(createMangaTile({
                    id: id,
                    title: createIconText({ text: title }),
                    image: image
                }));
            }
        });

        const hasNext = $('a.next, a[rel="next"]').length > 0;

        return createPagedResults({
            results: tiles,
            metadata: hasNext ? { page: page + 1 } : undefined
        });
    }

    async getHomePageSections(sectionCallback) {
        // Latest Updates Section
        const latestSection = createHomeSection({
            id: 'latest',
            title: 'Últimas Actualizaciones',
            type: types_1.HomeSectionType.singleRowNormal,
            view_more: true
        });
        sectionCallback(latestSection);

        // Popular Section
        const popularSection = createHomeSection({
            id: 'popular',
            title: 'Populares',
            type: types_1.HomeSectionType.singleRowLarge,
            view_more: false
        });
        sectionCallback(popularSection);

        // Fetch latest from /lista
        const latestRequest = createRequestObject({
            url: `${BASE_URL}/lista`,
            method: "GET"
        });
        const latestResponse = await this.requestManager.schedule(latestRequest, 1);
        const $ = this.cheerio.load(latestResponse.data);

        const latestTiles = [];
        $('div.bs div.bsx a').slice(0, 20).each((i, el) => {
            const $el = $(el);
            const link = $el.attr('href') || "";
            const title = $el.find('div.tt').text().trim() || $el.attr('title') || "";
            let image = $el.find('img.ts-post-image').attr('src') || "";
            if (image.startsWith('//')) image = 'https:' + image;

            const idMatch = link.match(/\/manga\/(\d+\/[^\/]+)/);
            const id = idMatch ? idMatch[1] : "";

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

        // For popular, use first 10 from latest
        popularSection.items = latestTiles.slice(0, 10);
        sectionCallback(popularSection);
    }

    async getViewMoreItems(homepageSectionId, metadata) {
        const page = metadata?.page ?? 1;
        const request = createRequestObject({
            url: `${BASE_URL}/lista?page=${page}`,
            method: "GET"
        });
        const response = await this.requestManager.schedule(request, 1);
        const $ = this.cheerio.load(response.data);

        const tiles = [];
        $('div.bs div.bsx a').each((i, el) => {
            const $el = $(el);
            const link = $el.attr('href') || "";
            const title = $el.find('div.tt').text().trim() || "";
            let image = $el.find('img.ts-post-image').attr('src') || "";
            if (image.startsWith('//')) image = 'https:' + image;

            const idMatch = link.match(/\/manga\/(\d+\/[^\/]+)/);
            const id = idMatch ? idMatch[1] : "";

            if (id && title) {
                tiles.push(createMangaTile({
                    id: id,
                    title: createIconText({ text: title }),
                    image: image
                }));
            }
        });

        const hasNext = $('a.next, a[rel="next"]').length > 0;

        return createPagedResults({
            results: tiles,
            metadata: hasNext ? { page: page + 1 } : undefined
        });
    }
}
exports.MangaTV = MangaTV;

},{"@paperback/types":61}]},{},[62])(62)
});
