# MangaTV Extension Skeleton

Este directorio contiene un esqueleto para crear una extensión de fuente que
raspe datos de `https://mangatv.net`.

## ¿Qué hacer?

1. Abre el sitio en tu navegador y usa las herramientas de desarrollador (Inspect)
   para observar la estructura HTML de:
   - Página principal / sección de manga
   - Página de detalles de cada manga
   - Página de lista de capítulos
   - Página de lectura de capítulos (imágenes)

2. Ajusta los selectores en `index.js`: las clases (`.manga_title`, `.chapter_list`,
   `.reader-area`, etc.) son solo ejemplos y casi seguro no coinciden con la web real.
   Cambia por las clases reales que encuentres.

3. Actualiza los generadores de URL si es necesario (algunas webs usan `/manga/123` o
   `/serie/xyz`).

4. Añade secciones extras para `getHomePageSections`, filtros, etc., si el sitio
   las soporta.

5. Copia esta carpeta a tu colección de extensiones y prueba en la app de Paperback/Felii.

6. Cuando funcione, puedes versionar, compilar o distribuir como desees.
