// Skeleton extension for MangaTV (https://mangatv.net)
// Adapt this by inspecting the target site's HTML structure and adjusting selectors.

const { Source, createRequestManager, createRequest, 
        createManga, createChapterDetails, createPagedResults, 
        MangaStatus, ContentRating } = require("@paperback/types");

const cheerio = require("cheerio");
const BASE_URL = "https://mangatv.net";

class MangaTV extends Source {
    constructor() {
        super(...arguments);
        this.requestManager = createRequestManager({
            requestsPerSecond: 2,
            requestTimeout: 15000,
        });
    }

    getSourceInfo() {
        return {
            version: "1.0.0",
            name: "MangaTV",
            icon: "icon.png",
            author: "Your Name",
            authorUrl: "https://your.website.example",
            description: "Source for mangatv.net",
            websiteBaseURL: BASE_URL,
            contentRating: ContentRating.EVERYONE,
            language: "en",
            hentaiSource: false,
            sourceTags: [],
        };
    }

    _buildReq(url) {
        return createRequest({
            url,
            method: "GET",
        });
    }

    async getMangaDetails(mangaId) {
        const url = `${BASE_URL}/manga/${mangaId}`;
        const data = await this.requestManager.schedule(this._buildReq(url), 1);
        const $ = cheerio.load(data.data);

        // TODO: update selectors based on real page
        return createManga({
            id: mangaId,
            titles: [$("h1.manga_title").text().trim() || ""],
            image: $(".cover img").attr("src") || "",
            status: MangaStatus.ONGOING,
            author: $(".author a").text().trim(),
            desc: $(".summary").text().trim(),
            tags: [],
        });
    }

    async getChapters(mangaId) {
        const url = `${BASE_URL}/manga/${mangaId}`;
        const data = await this.requestManager.schedule(this._buildReq(url), 1);
        const $ = cheerio.load(data.data);

        const chapters = [];
        // update selector based on MamgaTV HTML
        $("ul.chapter_list li").each((i, el) => {
            const elem = $(el);
            const chapterUrl = elem.find("a").attr("href") || "";
            const id = chapterUrl.split("/").pop();
            chapters.push({
                id,
                mangaId,
                name: elem.find("a").text().trim(),
                langCode: "en",
                chapNum: parseFloat(elem.find("span.chapter_num").text()) || 0,
                time: new Date(),
            });
        });
        return chapters;
    }

    async getChapterDetails(mangaId, chapterId) {
        const chapterUrl = `${BASE_URL}/chapter/${chapterId}`;
        const data = await this.requestManager.schedule(this._buildReq(chapterUrl), 1);
        const $ = cheerio.load(data.data);

        const pages = [];
        $(".reader-area img").each((i, el) => {
            pages.push($(el).attr("src") || "");
        });
        return createChapterDetails({
            id: chapterId,
            mangaId,
            pages,
        });
    }

    async searchRequest(query, metadata) {
        const term = encodeURIComponent(query.title || "");
        const url = `${BASE_URL}/search?keyword=${term}`;
        return this._buildReq(url);
    }

    async getSearchResults(query, metadata) {
        const response = await this.requestManager.schedule(await this.searchRequest(query, metadata), 1);
        const $ = cheerio.load(response.data);
        const results = [];
        $(".search-result-item").each((i, el) => {
            const e = $(el);
            const a = e.find("a");
            const href = a.attr("href") || "";
            results.push({
                id: href.split("/").pop(),
                title: a.text().trim(),
                image: e.find("img").attr("src") || "",
            });
        });
        return createPagedResults({ results });
    }
}

module.exports = MangaTV;
