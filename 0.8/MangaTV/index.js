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
const MAX_HOMEPAGE_ITEMS = 20;

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
                        "Referer": BASE_URL + "/",
                        "Origin": BASE_URL
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

            // Try multiple selectors for title
            const title = $("h1.entry-title").text().trim() || 
                         $("h1.post-title").text().trim() ||
                         $(".manga-title").text().trim() ||
                         $("h1").first().text().trim() || 
                         "Unknown";
            
            // Try multiple selectors for image
            const image = $("div.thumbook img").first().attr("src") || 
                         $("div.thumbook img").first().attr("data-src") ||
                         $("div.thumb img").first().attr("src") ||
                         $("div.thumb img").first().attr("data-src") ||
                         $("img.wp-post-image").first().attr("src") ||
                         "";
            
            // Try multiple selectors for description
            const desc = $("div.wd-full p").text().trim() || 
                        $("div.entry-content p").text().trim() ||
                        $("div.summary__content p").text().trim() ||
                        $("div.description p").text().trim() ||
                        "";
            
            console.log(`[MangaTV] Fetched details for manga: ${mangaId}, title: ${title}`);
            
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
            console.error(`[MangaTV] Error fetching manga details for ${mangaId}:`, error);
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
            
            // Try multiple selectors for chapter list
            const selectors = [
                "ul.clstyle li",
                "div.eplister ul li",
                "div.chapter-list li",
                "ul.chapters li",
                "div.chapterlist li"
            ];
            
            let found = false;
            for (const selector of selectors) {
                const elements = $(selector);
                if (elements.length > 0) {
                    console.log(`[MangaTV] Found ${elements.length} chapters using selector: ${selector}`);
                    elements.each((i, el) => {
                        const $el = $(el);
                        const link = $el.find("a").first();
                        const href = link.attr("href") || "";
                        
                        if (!href) return;
                        
                        // Support multiple URL formats
                        let chapId = href.split("/").filter(x => x).pop();
                        const name = link.text().trim() || 
                                   $el.find(".chapternum").text().trim() ||
                                   $el.find(".chapter-title").text().trim() ||
                                   `Chapter ${i + 1}`;
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
                    found = true;
                    break;
                }
            }
            
            if (!found) {
                console.warn(`[MangaTV] No chapters found for manga: ${mangaId}`);
            }

            return chapters;
        } catch (error) {
            console.error(`[MangaTV] Error fetching chapters for ${mangaId}:`, error);
            throw error;
        }
    }

    async getChapterDetails(mangaId, chapterId) {
        try {
            // Support multiple URL formats
            let url = `${BASE_URL}/leer/${chapterId}/`;
            
            const request = createRequestObject({
                url: url,
                method: "GET"
            });
            const response = await this.requestManager.schedule(request, 1);
            const $ = cheerio.load(response.data);

            const pages = [];
            const seenUrls = new Set();
            
            // Try multiple selectors for image containers
            const selectors = [
                "div.visor img",
                "div.readerarea img",
                "div.read-content img",
                "div.reading-content img",
                "div#readerarea img",
                "div.reader-area img",
                "img.wp-manga-chapter-img"
            ];
            
            for (const selector of selectors) {
                $(selector).each((i, el) => {
                    const src = $(el).attr("src") || 
                               $(el).attr("data-src") || 
                               $(el).attr("data-lazy-src") ||
                               "";
                    if (src && src.length > 0) {
                        const normalizedUrl = this.normalizeImageUrl(src);
                        if (!seenUrls.has(normalizedUrl)) {
                            seenUrls.add(normalizedUrl);
                            pages.push(normalizedUrl);
                        }
                    }
                });
                
                if (pages.length > 0) {
                    console.log(`[MangaTV] Found ${pages.length} pages for chapter ${chapterId} using selector: ${selector}`);
                    break;
                }
            }
            
            if (pages.length === 0) {
                console.warn(`[MangaTV] No pages found for chapter: ${chapterId}`);
            }

            return createChapterDetails({
                id: chapterId,
                mangaId: mangaId,
                pages: pages
            });
        } catch (error) {
            console.error(`[MangaTV] Error fetching chapter details for ${chapterId}:`, error);
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
            
            // Try multiple selectors for search results
            const selectors = [
                "div.bsx",
                "div.listupd article",
                "div.bs",
                "div.manga-item"
            ];
            
            for (const selector of selectors) {
                $(selector).each((i, el) => {
                    const $el = $(el);
                    const link = $el.find("a").first();
                    const href = link.attr("href") || "";
                    const id = href.split("/").filter(x => x).pop();
                    const title = $el.find(".tt").text().trim() || 
                                 $el.find(".title").text().trim() ||
                                 $el.find("h3").text().trim() ||
                                 link.attr("title") || "";
                    const image = $el.find("img").attr("src") || 
                                 $el.find("img").attr("data-src") ||
                                 "";

                    if (id && title) {
                        results.push(createMangaTile({
                            id: id,
                            title: { text: title },
                            image: this.normalizeImageUrl(image)
                        }));
                    }
                });
                
                if (results.length > 0) {
                    console.log(`[MangaTV] Found ${results.length} search results using selector: ${selector}`);
                    break;
                }
            }

            return createPagedResults({ results: results });
        } catch (error) {
            console.error(`[MangaTV] Error in search:`, error);
            return createPagedResults({ results: [] });
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
            
            // Try multiple selectors for manga items
            const selectors = [
                "div.bsx",
                "div.listupd article",
                "div.bs",
                "div.manga-item"
            ];
            
            for (const selector of selectors) {
                $(selector).each((i, el) => {
                    if (i >= MAX_HOMEPAGE_ITEMS) return false;
                    
                    const $el = $(el);
                    const link = $el.find("a").first();
                    const href = link.attr("href") || "";
                    const id = href.split("/").filter(x => x).pop();
                    const title = $el.find(".tt").text().trim() || 
                                 $el.find(".title").text().trim() ||
                                 $el.find("h3").text().trim() ||
                                 link.attr("title") || "";
                    const image = $el.find("img").attr("src") || 
                                 $el.find("img").attr("data-src") ||
                                 "";

                    if (id && title) {
                        items.push(createMangaTile({
                            id: id,
                            title: { text: title },
                            image: this.normalizeImageUrl(image)
                        }));
                    }
                });
                
                if (items.length > 0) {
                    console.log(`[MangaTV] Found ${items.length} items for homepage using selector: ${selector}`);
                    break;
                }
            }

            section.items = items;
            sectionCallback(section);
        } catch (error) {
            console.error(`[MangaTV] Error fetching homepage sections:`, error);
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
}

module.exports = MangaTV;
