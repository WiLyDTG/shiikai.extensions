// MangaTV extension for https://mangatv.net
// Adapt selectors and URLs based on actual site structure

const { 
    Source, 
    createRequestManager, 
    createRequestObject,
    createManga, 
    createChapter, 
    createChapterDetails,
    createPagedResults,
    createHomeSection,
    createMangaTile,
    MangaStatus, 
    ContentRating,
    HomeSectionType 
} = require("@paperback/types");

const cheerio = require("cheerio");

const BASE_URL = "https://mangatv.net";

class MangaTV extends Source {
    constructor() {
        super();
        this.requestManager = createRequestManager({
            requestsPerSecond: 2,
            requestTimeout: 15000,
            interceptor: {
                interceptRequest: async (request) => {
                    request.headers = {
                        ...(request.headers || {}),
                        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
                        "Referer": BASE_URL + "/"
                    };
                    return request;
                },
                interceptResponse: async (response) => response
            }
        });
    }

    getSourceInfo() {
        return {
            version: "1.0.0",
            name: "MangaTV",
            icon: "icon.png",
            author: "Generated",
            description: "Source for mangatv.net",
            contentRating: ContentRating.MATURE,
            websiteBaseURL: BASE_URL,
            language: "es",
            hentaiSource: false
        };
    }

    async getMangaDetails(mangaId) {
        const request = createRequestObject({
            url: `${BASE_URL}/manga/${mangaId}/`,
            method: "GET"
        });
        const response = await this.requestManager.schedule(request, 1);
        const $ = cheerio.load(response.data);

        const title = $("h1.entry-title").text().trim() || "Unknown";
        const image = $("div.thumbook img").first().attr("src") || "";
        const desc = $("div.wd-full p").text().trim() || "";
        
        return createManga({
            id: mangaId,
            titles: [title],
            image: this.normalizeImageUrl(image),
            status: MangaStatus.ONGOING,
            author: "",
            desc: desc,
            tags: []
        });
    }

    async getChapters(mangaId) {
        const request = createRequestObject({
            url: `${BASE_URL}/manga/${mangaId}/`,
            method: "GET"
        });
        const response = await this.requestManager.schedule(request, 1);
        const $ = cheerio.load(response.data);

        const chapters = [];
        $("ul.clstyle li").each((i, el) => {
            const $el = $(el);
            const link = $el.find("a").first();
            const href = link.attr("href") || "";
            
            if (!href) return;
            
            const chapId = href.split("/").filter(x => x).pop();
            const name = link.text().trim();
            const chapNum = this.extractChapterNumber(name);
            
            chapters.push(createChapter({
                id: chapId,
                mangaId: mangaId,
                name: name,
                chapNum: chapNum,
                time: new Date(),
                langCode: "es"
            }));
        });

        return chapters;
    }

    async getChapterDetails(mangaId, chapterId) {
        const request = createRequestObject({
            url: `${BASE_URL}/leer/${chapterId}/`,
            method: "GET"
        });
        const response = await this.requestManager.schedule(request, 1);
        const $ = cheerio.load(response.data);

        const pages = [];
        
        // Try multiple selectors for image containers
        $("div.visor img, div.readerarea img, div.read-content img").each((i, el) => {
            const src = $(el).attr("src") || $(el).attr("data-src") || "";
            if (src && src.length > 0) {
                pages.push(this.normalizeImageUrl(src));
            }
        });

        return createChapterDetails({
            id: chapterId,
            mangaId: mangaId,
            pages: pages
        });
    }

    async searchRequest(query, metadata) {
        const term = encodeURIComponent(query.title || "");
        return createRequestObject({
            url: `${BASE_URL}/lista?s=${term}`,
            method: "GET"
        });
    }

    async getSearchResults(query, metadata) {
        const request = await this.searchRequest(query, metadata);
        const response = await this.requestManager.schedule(request, 1);
        const $ = cheerio.load(response.data);

        const results = [];
        $("div.bsx").each((i, el) => {
            const $el = $(el);
            const link = $el.find("a").first();
            const href = link.attr("href") || "";
            const id = href.split("/").filter(x => x).pop();
            const title = $el.find(".tt").text().trim();
            const image = $el.find("img").attr("src") || "";

            if (id && title) {
                results.push(createMangaTile({
                    id: id,
                    title: { text: title },
                    image: this.normalizeImageUrl(image)
                }));
            }
        });

        return createPagedResults({ results: results });
    }

    async getHomePageSections(sectionCallback) {
        const request = createRequestObject({
            url: BASE_URL,
            method: "GET"
        });
        const response = await this.requestManager.schedule(request, 1);
        const $ = cheerio.load(response.data);

        const section = createHomeSection({
            id: "latest",
            title: "Últimos mangás",
            type: HomeSectionType.singleRowNormal
        });

        const items = [];
        $("div.bsx").each((i, el) => {
            if (i >= 20) return; // limit to 20
            
            const $el = $(el);
            const link = $el.find("a").first();
            const href = link.attr("href") || "";
            const id = href.split("/").filter(x => x).pop();
            const title = $el.find(".tt").text().trim();
            const image = $el.find("img").attr("src") || "";

            if (id && title) {
                items.push(createMangaTile({
                    id: id,
                    title: { text: title },
                    image: this.normalizeImageUrl(image)
                }));
            }
        });

        section.items = items;
        sectionCallback(section);
    }

    async getViewMoreItems(homepageSectionId, metadata) {
        return createPagedResults({ results: [] });
    }

    normalizeImageUrl(url) {
        if (!url) return "";
        if (url.startsWith("//")) return "https:" + url;
        if (url.startsWith("http")) return url;
        if (url.startsWith("/")) return BASE_URL + url;
        return url;
    }

    extractChapterNumber(name) {
        const match = name.match(/(\d+(?:\.\d+)?)/);
        return match ? parseFloat(match[1]) : 0;
    }
}

module.exports = MangaTV;
