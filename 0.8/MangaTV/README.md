# MangaTV Extension

Extensión de Paperback/Felii para scrapear manga desde [mangatv.net](https://mangatv.net).

## Características

- **Múltiples selectores CSS**: La extensión utiliza múltiples selectores para garantizar compatibilidad con cambios en la estructura del sitio web.
- **Manejo robusto de errores**: Incluye try-catch y logging para facilitar el debugging.
- **Headers HTTP adecuados**: Evita bloqueos mediante headers de navegador completos.
- **Soporte para múltiples formatos**: Compatible con diferentes estructuras de URL y formatos de imágenes.
- **Extracción optimizada**: Busca elementos con múltiples métodos alternativos.

## Instalación

1. Copia esta carpeta a tu colección de extensiones de Paperback/Felii
2. Instala las dependencias (si trabajas en desarrollo local):
   ```bash
   npm install
   ```

## Estructura del código

### Constructor
Configura el Request Manager con:
- Rate limiting: 2 requests por segundo
- Timeout: 15 segundos
- Headers HTTP completos (User-Agent, Accept, Accept-Language, Referer, Origin)

### Métodos principales

#### `getMangaDetails(mangaId)`
Obtiene los detalles de un manga específico. Intenta múltiples selectores para:
- Título: `h1.entry-title`, `h1.post-title`, `.manga-title`, etc.
- Imagen: `div.thumbook img`, `div.thumb img`, `img.wp-post-image`, etc.
- Descripción: `div.wd-full p`, `div.entry-content p`, etc.

#### `getChapters(mangaId)`
Lista todos los capítulos de un manga. Intenta múltiples selectores:
- `ul.clstyle li`
- `div.eplister ul li`
- `div.chapter-list li`
- `ul.chapters li`
- `div.chapterlist li`

#### `getChapterDetails(mangaId, chapterId)`
Obtiene las páginas de un capítulo. Busca imágenes usando:
- `div.visor img`
- `div.readerarea img`
- `div.read-content img`
- `div.reading-content img`
- `img.wp-manga-chapter-img`

También intenta múltiples atributos de imagen: `src`, `data-src`, `data-lazy-src`

#### `getSearchResults(query, metadata)`
Busca manga por título. Usa múltiples selectores para resultados:
- `div.bsx`
- `div.listupd article`
- `div.bs`
- `div.manga-item`

#### `getHomePageSections(sectionCallback)`
Muestra los últimos manga de la página principal (máximo 20).

## URLs soportadas

- Base: `https://mangatv.net`
- Manga: `https://mangatv.net/manga/{mangaId}/`
- Capítulo: `https://mangatv.net/leer/{chapterId}/`
- Búsqueda: `https://mangatv.net/lista?s={query}`

## Debugging

La extensión incluye logging con `console.log` y `console.error` para facilitar el debugging:
- Información de manga encontrado
- Número de capítulos detectados
- Páginas encontradas por capítulo
- Resultados de búsqueda
- Errores detallados

## Solución de problemas

### No se encuentran capítulos o imágenes
- La estructura del sitio web puede haber cambiado
- Abre la página en tu navegador y usa las herramientas de desarrollador (F12)
- Identifica los selectores CSS correctos
- Agrega nuevos selectores en el array de selectores correspondiente

### Errores de bloqueo
- Verifica que los headers HTTP estén configurados correctamente
- El sitio puede estar bloqueando requests automatizadas
- Considera ajustar el rate limiting (requestsPerSecond)

### Imágenes no cargan
- Verifica que la función `normalizeImageUrl` esté procesando las URLs correctamente
- Algunas imágenes pueden usar lazy loading (atributos `data-src` o `data-lazy-src`)
- Revisa la consola para ver qué URLs se están generando

## Desarrollo

Para modificar o mejorar esta extensión:

1. Inspecciona el sitio web con las herramientas de desarrollador del navegador
2. Identifica los selectores CSS actuales
3. Actualiza los arrays de selectores en los métodos correspondientes
4. Prueba los cambios en la aplicación
5. Revisa los logs en la consola para verificar que funciona correctamente

## Compatibilidad

- **Lenguaje**: Español (es)
- **Rating**: Mature
- **Plataforma**: Paperback/Felii

## Licencia

MIT
