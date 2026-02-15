import {
  Source,
  ContentRating,
  HomeSectionType,
} from '@paperback/types/lib/compat/0.8/types.js';

// Polyfill de funciones globales para Paperback 0.8
const createRequestManager = (info) => globalThis.App?.createRequestManager?.(info) ?? info;
const createRequestObject = (info) => globalThis.App?.createRequestObject?.(info) ?? info;
const createManga = (info) => globalThis.App?.createManga?.(info) ?? info;
const createChapter = (info) => globalThis.App?.createChapter?.(info) ?? info;
const createChapterDetails = (info) => globalThis.App?.createChapterDetails?.(info) ?? info;
const createMangaTile = (info) => globalThis.App?.createMangaTile?.(info) ?? info;
const createHomeSection = (info) => globalThis.App?.createHomeSection?.(info) ?? info;
const createPagedResults = (info) => globalThis.App?.createPagedResults?.(info) ?? info;
const createTag = (info) => globalThis.App?.createTag?.(info) ?? info;
const createTagSection = (info) => globalThis.App?.createTagSection?.(info) ?? info;
const createIconText = (info) => globalThis.App?.createIconText?.(info) ?? info;

const MANGATV_DOMAIN = 'https://mangatv.net';

export const MangaTVInfo = {
  version: '1.0.0',
  name: 'MangaTV',
  icon: 'icon.png',
  author: 'WiLyDTG',
  authorWebsite: 'https://github.com/WiLyDTG',
  description: 'Extension para leer manga desde mangatv.net',
  contentRating: ContentRating.MATURE,
  websiteBaseURL: MANGATV_DOMAIN,
  sourceTags: [
    {
      text: 'Spanish',
      type: 'info'
    },
    {
      text: 'Manga',
      type: 'success'
    }
  ],
  intents: 31
};

export class MangaTV extends Source {
  requestManager = createRequestManager({
    requestsPerSecond: 3,
    requestTimeout: 15000,
    interceptor: {
      interceptRequest: async (request) => {
        request.headers = {
          ...(request.headers ?? {}),
          'Referer': MANGATV_DOMAIN,
          'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1'
        };
        return request;
      },
      interceptResponse: async (response) => {
        return response;
      }
    }
  });
  
  baseUrl = MANGATV_DOMAIN;

  getMangaShareUrl(mangaId) {
    return `${this.baseUrl}/manga/${mangaId}`;
  }

  async getMangaDetails(mangaId) {
    const request = createRequestObject({
      url: `${this.baseUrl}/manga/${mangaId}`,
      method: 'GET'
    });

    const response = await this.requestManager.schedule(request, 1);
    const $ = this.cheerio.load(response.data);

    const title = $('h1').first().text().trim() || 
                  $('meta[property="og:title"]').attr('content') || 
                  'Sin titulo';
    
    let image = $('img[src*="library"]').first().attr('src') ||
                $('img[data-src*="library"]').first().attr('data-src') ||
                $('meta[property="og:image"]').attr('content') || '';
    
    if (image && !image.startsWith('http')) {
      image = image.startsWith('//') ? `https:${image}` : `${this.baseUrl}${image}`;
    }

    const descElement = $('p').filter((_, el) => {
      const text = $(el).text();
      return text.length > 100 && !text.includes('Las imagenes mostradas');
    }).first();
    const desc = descElement.text().trim() || 
                 $('meta[name="description"]').attr('content') || '';

    let status = 0; // ONGOING
    const statusText = $('*:contains("Estado")').text().toLowerCase();
    if (statusText.includes('finalizado') || statusText.includes('completed')) {
      status = 1; // COMPLETED
    }

    const tags = [];
    $('a[href*="genre"]').each((_, el) => {
      const tagName = $(el).text().trim();
      if (tagName) {
        tags.push(createTag({ id: tagName.toLowerCase(), label: tagName }));
      }
    });

    let author = '';
    const authorEl = $('*:contains("Autor")').next().text().trim();
    if (authorEl) {
      author = authorEl;
    }

    return createManga({
      id: mangaId,
      titles: [title],
      image: image,
      status: status,
      author: author,
      artist: author,
      tags: [createTagSection({ id: '0', label: 'Generos', tags: tags })],
      desc: desc,
      rating: 0
    });
  }

  async getChapters(mangaId) {
    const request = createRequestObject({
      url: `${this.baseUrl}/manga/${mangaId}`,
      method: 'GET'
    });

    const response = await this.requestManager.schedule(request, 1);
    const $ = this.cheerio.load(response.data);

    const chapters = [];

    $('a[href*="/leer/"]').each((index, el) => {
      const link = $(el).attr('href');
      if (!link) return;

      const chapterId = link.split('/leer/')[1]?.split('/')[0];
      if (!chapterId) return;

      const parentText = $(el).parent().text() || $(el).text();
      const chapterMatch = parentText.match(/Cap[ii]tulo\s*([\d.]+)/i);
      const chapterNum = chapterMatch ? parseFloat(chapterMatch[1]) : index + 1;

      let dateStr = '';
      const dateMatch = parentText.match(/(\d{4}-\d{2}-\d{2})/);
      if (dateMatch) {
        dateStr = dateMatch[1];
      }

      let group = '';
      const groupMatch = parentText.match(/([A-Za-z\s]+Scan[s]?|[A-Za-z\s]+Fansub)/i);
      if (groupMatch) {
        group = groupMatch[1].trim();
      }

      const exists = chapters.find(ch => ch.id === chapterId);
      if (!exists) {
        chapters.push(createChapter({
          id: chapterId,
          mangaId: mangaId,
          name: `Capitulo ${chapterNum}`,
          langCode: 'es',
          chapNum: chapterNum,
          time: dateStr ? new Date(dateStr) : new Date(),
          group: group
        }));
      }
    });

    chapters.sort((a, b) => b.chapNum - a.chapNum);
    return chapters;
  }

  async getChapterDetails(mangaId, chapterId) {
    const request = createRequestObject({
      url: `${this.baseUrl}/leer/${chapterId}`,
      method: 'GET'
    });

    const response = await this.requestManager.schedule(request, 1);
    const $ = this.cheerio.load(response.data);

    const pages = [];

    // Buscar imagenes del lector
    $('img').each((_, el) => {
      let src = $(el).attr('src') || $(el).attr('data-src');
      if (src) {
        if (src.startsWith('//')) {
          src = `https:${src}`;
        }
        // Solo incluir imagenes del CDN de MangaTV
        if (src.includes('img5.mangatv.net') || (src.includes('mangatv.net') && src.includes('/library/'))) {
          if (!pages.includes(src)) {
            pages.push(src);
          }
        }
      }
    });

    // Alternativa: buscar en scripts de la pagina
    if (pages.length === 0) {
      const scriptContent = $('script').text();
      const imageMatches = scriptContent.match(/https?:\/\/[^"'\s]+\.(?:jpg|jpeg|png|webp|gif)/gi);
      if (imageMatches) {
        imageMatches.forEach(url => {
          if ((url.includes('mangatv.net') || url.includes('img5.')) && !pages.includes(url)) {
            pages.push(url);
          }
        });
      }
    }

    return createChapterDetails({
      id: chapterId,
      mangaId: mangaId,
      pages: pages
    });
  }

  async getSearchResults(query, metadata) {
    const page = metadata?.page || 1;
    let url = `${this.baseUrl}/lista?page=${page}`;

    if (query.title) {
      url = `${this.baseUrl}/lista?buscar=${encodeURIComponent(query.title)}&page=${page}`;
    }

    if (query.includedTags && query.includedTags.length > 0) {
      const genres = query.includedTags.map(t => encodeURIComponent(t.id)).join('&genre[]=');
      url += `&genre[]=${genres}`;
    }

    const request = createRequestObject({
      url: url,
      method: 'GET'
    });

    const response = await this.requestManager.schedule(request, 1);
    const $ = this.cheerio.load(response.data);

    const manga = [];

    $('a[href*="/manga/"]').each((_, el) => {
      const link = $(el).attr('href');
      if (!link || link.includes('/lista')) return;

      const match = link.match(/\/manga\/(\d+\/[^/]+)/);
      if (!match) return;

      const mangaId = match[1];
      const title = $(el).text().trim() || $(el).find('img').attr('alt') || 'Sin titulo';
      
      let image = $(el).find('img').attr('src') || 
                  $(el).find('img').attr('data-src') || '';
      
      if (image && image.startsWith('//')) {
        image = `https:${image}`;
      }

      const exists = manga.find(m => m.id === mangaId);
      if (!exists && title.length > 0 && !title.includes('VER TODO')) {
        manga.push(createMangaTile({
          id: mangaId,
          image: image || `${this.baseUrl}/assets/images/black.png`,
          title: createIconText({ text: title })
        }));
      }
    });

    const hasNext = $('a[href*="page=' + (page + 1) + '"]').length > 0 ||
                    $('a:contains("Next")').length > 0 ||
                    $('a:contains(">>")').length > 0;

    return createPagedResults({
      results: manga,
      metadata: hasNext ? { page: page + 1 } : undefined
    });
  }

  async getHomePageSections(sectionCallback) {
    const latestSection = createHomeSection({
      id: 'latest',
      title: 'Ultimas Actualizaciones',
      type: HomeSectionType.singleRowNormal,
      view_more: true
    });

    const popularSection = createHomeSection({
      id: 'popular',
      title: 'Mangas Populares',
      type: HomeSectionType.singleRowLarge,
      view_more: true
    });

    sectionCallback(latestSection);
    sectionCallback(popularSection);

    // Cargar ultimas actualizaciones
    const latestRequest = createRequestObject({
      url: `${this.baseUrl}/lista`,
      method: 'GET'
    });

    const latestResponse = await this.requestManager.schedule(latestRequest, 1);
    const $latest = this.cheerio.load(latestResponse.data);

    const latestManga = [];
    $latest('a[href*="/manga/"]').each((_, el) => {
      const link = $latest(el).attr('href');
      if (!link || link.includes('/lista')) return;

      const match = link.match(/\/manga\/(\d+\/[^/]+)/);
      if (!match) return;

      const mangaId = match[1];
      const title = $latest(el).text().trim();
      
      let image = $latest(el).find('img').attr('src') || 
                  $latest(el).find('img').attr('data-src') || '';
      
      if (image && image.startsWith('//')) {
        image = `https:${image}`;
      }

      const exists = latestManga.find(m => m.id === mangaId);
      if (!exists && title.length > 2 && !title.includes('VER TODO')) {
        latestManga.push(createMangaTile({
          id: mangaId,
          image: image || `${this.baseUrl}/assets/images/black.png`,
          title: createIconText({ text: title })
        }));
      }
    });

    latestSection.items = latestManga.slice(0, 20);
    sectionCallback(latestSection);

    // Cargar mangas populares desde la pagina principal
    const popularRequest = createRequestObject({
      url: this.baseUrl,
      method: 'GET'
    });

    const popularResponse = await this.requestManager.schedule(popularRequest, 1);
    const $popular = this.cheerio.load(popularResponse.data);

    const popularManga = [];
    $popular('a[href*="/manga/"]').each((_, el) => {
      const link = $popular(el).attr('href');
      if (!link) return;

      const match = link.match(/\/manga\/(\d+\/[^/]+)/);
      if (!match) return;

      const mangaId = match[1];
      const title = $popular(el).text().trim();
      
      let image = $popular(el).find('img').attr('src') || 
                  $popular(el).find('img').attr('data-src') || '';
      
      if (image && image.startsWith('//')) {
        image = `https:${image}`;
      }

      const exists = popularManga.find(m => m.id === mangaId);
      if (!exists && title.length > 2 && !title.includes('VER TODO')) {
        popularManga.push(createMangaTile({
          id: mangaId,
          image: image || `${this.baseUrl}/assets/images/black.png`,
          title: createIconText({ text: title })
        }));
      }
    });

    popularSection.items = popularManga.slice(0, 20);
    sectionCallback(popularSection);
  }

  async getViewMoreItems(homepageSectionId, metadata) {
    const page = metadata?.page || 1;
    let url = `${this.baseUrl}/lista?page=${page}`;

    if (homepageSectionId === 'popular') {
      url = `${this.baseUrl}/lista?ordenar=votos&page=${page}`;
    }

    const request = createRequestObject({
      url: url,
      method: 'GET'
    });

    const response = await this.requestManager.schedule(request, 1);
    const $ = this.cheerio.load(response.data);

    const manga = [];

    $('a[href*="/manga/"]').each((_, el) => {
      const link = $(el).attr('href');
      if (!link || link.includes('/lista')) return;

      const match = link.match(/\/manga\/(\d+\/[^/]+)/);
      if (!match) return;

      const mangaId = match[1];
      const title = $(el).text().trim();
      
      let image = $(el).find('img').attr('src') || 
                  $(el).find('img').attr('data-src') || '';
      
      if (image && image.startsWith('//')) {
        image = `https:${image}`;
      }

      const exists = manga.find(m => m.id === mangaId);
      if (!exists && title.length > 2 && !title.includes('VER TODO')) {
        manga.push(createMangaTile({
          id: mangaId,
          image: image || `${this.baseUrl}/assets/images/black.png`,
          title: createIconText({ text: title })
        }));
      }
    });

    const hasNext = $('a[href*="page=' + (page + 1) + '"]').length > 0 ||
                    $('a:contains(">>")').length > 0;

    return createPagedResults({
      results: manga,
      metadata: hasNext ? { page: page + 1 } : undefined
    });
  }

  async getSearchTags() {
    const request = createRequestObject({
      url: `${this.baseUrl}/lista`,
      method: 'GET'
    });

    const response = await this.requestManager.schedule(request, 1);
    const $ = this.cheerio.load(response.data);

    const genres = [];
    $('select[name="generos"] option, a[href*="genre"]').each((_, el) => {
      const value = $(el).attr('value') || $(el).text().trim();
      const label = $(el).text().trim();
      if (value && label && label !== 'Todos') {
        const exists = genres.find(g => g.id === value.toLowerCase());
        if (!exists) {
          genres.push(createTag({ id: value.toLowerCase(), label: label }));
        }
      }
    });

    const types = [];
    $('select[name="tipos"] option').each((_, el) => {
      const value = $(el).attr('value');
      const label = $(el).text().trim();
      if (value && label && label !== 'Todos') {
        types.push(createTag({ id: value, label: label }));
      }
    });

    return [
      createTagSection({ id: 'genres', label: 'Generos', tags: genres }),
      createTagSection({ id: 'types', label: 'Tipo', tags: types })
    ];
  }

  getCloudflareBypassRequest() {
    return createRequestObject({
      url: this.baseUrl,
      method: 'GET',
      headers: {
        'referer': this.baseUrl,
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
  }
}
