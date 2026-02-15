// MangaTV extension for mangatv.net
// Paperback/Felii compatible source

const {
    Source,
    createRequestManager,
    createRequestObject,
    createManga,
    createChapter,
    createChapterDetails,
    createHomeSectionRequest,
    createPagedResults,
    createHomeSection, 
    createMangaTile,
    MangaStatus,
    ContentRating,
    HomeSectionType
} = typeof require !== 'undefined' ? require("@paperback/types") : window.types;

const cheerio = typeof require !== 'undefined' ? require("cheerio") : window.cheerio;

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
                        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
                        "Accept-Language": "es-ES,es;q=0.9,en;q=0.8",
                        "Accept-Encoding": "gzip, deflate, br",
                        "DNT": "1",
                        "Connection": "keep-alive",
                        "Upgrade-Insecure-Requests": "1",
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
        try {
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
        } catch (error) {
            console.error(`Error fetching manga details for ${mangaId}:`, error);
            throw error;
        }
    }

    async getChapters(mangaId) {
        try {
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
        } catch (error) {
            console.error(`Error fetching chapters for ${mangaId}:`, error);
            throw error;
        }
    }

    async getChapterDetails(mangaId, chapterId) {
        try {
            const request = createRequestObject({
                url: `${BASE_URL}/leer/${chapterId}/`,
                method: "GET"
            });
            const response = await this.requestManager.schedule(request, 1);
            const $ = cheerio.load(response.data);

            const pages = [];
            
            // Look for img tags in reader area
            $("div.visor img").each((i, el) => {
                const src = $(el).attr("src") || $(el).attr("data-src") || "";
                if (src && src.length > 0) {
                    pages.push(this.normalizeImageUrl(src));
                }
            });

            // If no imgs found, try alt selector
            if (pages.length === 0) {
                $("div.readerarea img").each((i, el) => {
                    const src = $(el).attr("src") || $(el).attr("data-src") || "";
                    if (src && src.length > 0) {
                        pages.push(this.normalizeImageUrl(src));
                    }
                });
            }

            return createChapterDetails({
                id: chapterId,
                mangaId: mangaId,
                pages: pages
            });
        } catch (error) {
            console.error(`Error fetching chapter details for ${chapterId}:`, error);
            throw error;
        }
    }

    async searchRequest(query, metadata) {
        const term = encodeURIComponent(query.title || "");
        return createRequestObject({
            url: `${BASE_URL}/lista?s=${term}`,
            method: "GET"
        });
    }

    async getSearchResults(query, metadata) {
        try {
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
        } catch (error) {
            console.error(`Error searching with query "${query.title}":`, error);
            throw error;
        }
    }

    async getHomePageSections(sectionCallback) {
        try {
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

            section.items = items.slice(0, 20);
            sectionCallback(section);
        } catch (error) {
            console.error("Error fetching home page sections:", error);
            throw error;
        }
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

    async getCloudflareBypassRequestAsync() {
        return createRequestObject({
            url: BASE_URL,
            method: "GET",
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
                "Accept-Language": "es-ES,es;q=0.9,en;q=0.8",
                "Accept-Encoding": "gzip, deflate, br",
                "DNT": "1",
                "Connection": "keep-alive",
                "Upgrade-Insecure-Requests": "1",
                "Referer": BASE_URL + "/"
            }
        });
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = MangaTV;
}
