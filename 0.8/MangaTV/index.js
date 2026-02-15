const {
  Source,
  Manga,
  Chapter,
  ChapterDetails,
  HomeSection,
  SearchRequest,
  PagedResults,
  SourceInfo,
  TagType,
  TagSection,
  ContentRating,
  HomeSectionType,
  MangaStatus,
  MangaTile,
  Tag
} = require('@paperback/types');

const MANGATV_DOMAIN = 'https://mangatv.net';
const MANGATV_API = 'https://mangatv.net';

const MangaTVInfo = {
  version: '1.0.0',
  name: 'MangaTV',
  icon: 'icon.png',
  author: 'WiLyDTG',
  authorWebsite: 'https://github.com/WiLyDTG',
  description: 'Extensión para leer manga desde mangatv.net',
  contentRating: ContentRating.MATURE,
  websiteBaseURL: MANGATV_DOMAIN,
  sourceTags: [
    {
      text: 'Spanish',
      type: TagType.GREY
    },
    {
      text: 'Manga',
      type: TagType.BLUE
    }
  ]
};

class MangaTV extends Source {
  constructor(cheerio) {
    super(cheerio);
    this.requestManager = this.createRequestManager({
      requestsPerSecond: 3,
      requestTimeout: 15000
    });
    this.baseUrl = MANGATV_DOMAIN;
  }

  getMangaShareUrl(mangaId) {
    return `${this.baseUrl}/manga/${mangaId}`;
  }

  async getMangaDetails(mangaId) {
    const request = this.createRequestObject({
      url: `${this.baseUrl}/manga/${mangaId}`,
      method: 'GET'
    });

    const response = await this.requestManager.schedule(request, 1);
    const $ = this.cheerio.load(response.data);

    const title = $('h1').first().text().trim() || 
                  $('meta[property="og:title"]').attr('content') || 
                  'Sin título';
    
    let image = $('img[src*="library"]').first().attr('src') ||
                $('img[data-src*="library"]').first().attr('data-src') ||
                $('meta[property="og:image"]').attr('content') || '';
    
    if (image && !image.startsWith('http')) {
      image = image.startsWith('//') ? `https:${image}` : `${this.baseUrl}${image}`;
    }

    const descElement = $('p').filter((_, el) => {
      const text = $(el).text();
      return text.length > 100 && !text.includes('Las imágenes mostradas');
    }).first();
    const desc = descElement.text().trim() || 
                 $('meta[name="description"]').attr('content') || '';

    let status = MangaStatus.ONGOING;
    const statusText = $('*:contains("Estado")').text().toLowerCase();
    if (statusText.includes('finalizado') || statusText.includes('completed')) {
      status = MangaStatus.COMPLETED;
    }

    const tags = [];
    $('a[href*="genre"]').each((_, el) => {
      const tagName = $(el).text().trim();
      if (tagName) {
        tags.push(this.createTag({ id: tagName.toLowerCase(), label: tagName }));
      }
    });

    let author = '';
    const authorEl = $('*:contains("Autor")').next().text().trim();
    if (authorEl) {
      author = authorEl;
    }

    return this.createManga({
      id: mangaId,
      titles: [title],
      image: image,
      status: status,
      author: author,
      artist: author,
      tags: [this.createTagSection({ id: '0', label: 'Géneros', tags: tags })],
      desc: desc,
      rating: 0
    });
  }

  async getChapters(mangaId) {
    const request = this.createRequestObject({
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
      const chapterMatch = parentText.match(/Cap[íi]tulo\s*([\d.]+)/i);
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
        chapters.push(this.createChapter({
          id: chapterId,
          mangaId: mangaId,
          name: `Capítulo ${chapterNum}`,
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
    const request = this.createRequestObject({
      url: `${this.baseUrl}/leer/${chapterId}`,
      method: 'GET'
    });

    const response = await this.requestManager.schedule(request, 1);
    const $ = this.cheerio.load(response.data);

    const pages = [];

    $('img[src*="mangatv.net/library"], img[data-src*="mangatv.net/library"]').each((_, el) => {
      let src = $(el).attr('src') || $(el).attr('data-src');
      if (src) {
        if (src.startsWith('//')) {
          src = `https:${src}`;
        }
        if (src.includes('/library/') && !pages.includes(src)) {
          pages.push(src);
        }
      }
    });

    if (pages.length === 0) {
      const scriptContent = $('script').text();
      const imageMatches = scriptContent.match(/https?:\/\/[^"'\s]+\.(?:jpg|jpeg|png|webp|gif)/gi);
      if (imageMatches) {
        imageMatches.forEach(url => {
          if (url.includes('mangatv.net') && url.includes('library') && !pages.includes(url)) {
            pages.push(url);
          }
        });
      }
    }

    return this.createChapterDetails({
      id: chapterId,
      mangaId: mangaId,
      pages: pages,
      longStrip: false
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

    const request = this.createRequestObject({
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
      const title = $(el).text().trim() || $(el).find('img').attr('alt') || 'Sin título';
      
      let image = $(el).find('img').attr('src') || 
                  $(el).find('img').attr('data-src') || '';
      
      if (image && image.startsWith('//')) {
        image = `https:${image}`;
      }

      const exists = manga.find(m => m.id === mangaId);
      if (!exists && title.length > 0 && !title.includes('VER TODO')) {
        manga.push(this.createMangaTile({
          id: mangaId,
          image: image || `${this.baseUrl}/assets/images/black.png`,
          title: this.createIconText({ text: title }),
          subtitleText: this.createIconText({ text: '' })
        }));
      }
    });

    const hasNext = $('a[href*="page=' + (page + 1) + '"]').length > 0 ||
                    $('a:contains("Next")').length > 0 ||
                    $('a:contains("")').length > 0;

    return this.createPagedResults({
      results: manga,
      metadata: hasNext ? { page: page + 1 } : undefined
    });
  }

  async getHomePageSections(sectionCallback) {
    const latestSection = this.createHomeSection({
      id: 'latest',
      title: 'Últimas Actualizaciones',
      type: HomeSectionType.singleRowNormal,
      view_more: true
    });

    const popularSection = this.createHomeSection({
      id: 'popular',
      title: 'Mangas Populares',
      type: HomeSectionType.singleRowNormal,
      view_more: true
    });

    sectionCallback(latestSection);
    sectionCallback(popularSection);

    const latestRequest = this.createRequestObject({
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
        latestManga.push(this.createMangaTile({
          id: mangaId,
          image: image || `${this.baseUrl}/assets/images/black.png`,
          title: this.createIconText({ text: title }),
          subtitleText: this.createIconText({ text: '' })
        }));
      }
    });

    latestSection.items = latestManga.slice(0, 20);
    sectionCallback(latestSection);

    const popularRequest = this.createRequestObject({
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
        popularManga.push(this.createMangaTile({
          id: mangaId,
          image: image || `${this.baseUrl}/assets/images/black.png`,
          title: this.createIconText({ text: title }),
          subtitleText: this.createIconText({ text: '' })
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

    const request = this.createRequestObject({
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
        manga.push(this.createMangaTile({
          id: mangaId,
          image: image || `${this.baseUrl}/assets/images/black.png`,
          title: this.createIconText({ text: title }),
          subtitleText: this.createIconText({ text: '' })
        }));
      }
    });

    const hasNext = $('a[href*="page=' + (page + 1) + '"]').length > 0 ||
                    $('a:contains("")').length > 0;

    return this.createPagedResults({
      results: manga,
      metadata: hasNext ? { page: page + 1 } : undefined
    });
  }

  async getTags() {
    const request = this.createRequestObject({
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
          genres.push(this.createTag({ id: value.toLowerCase(), label: label }));
        }
      }
    });

    const types = [];
    $('select[name="tipos"] option').each((_, el) => {
      const value = $(el).attr('value');
      const label = $(el).text().trim();
      if (value && label && label !== 'Todos') {
        types.push(this.createTag({ id: value, label: label }));
      }
    });

    return [
      this.createTagSection({ id: 'genres', label: 'Géneros', tags: genres }),
      this.createTagSection({ id: 'types', label: 'Tipo', tags: types })
    ];
  }

  getCloudflareBypassRequestAsync() {
    return this.createRequestObject({
      url: this.baseUrl,
      method: 'GET',
      headers: {
        'referer': this.baseUrl,
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
  }
}

module.exports = {
  MangaTVInfo,
  MangaTV
};
