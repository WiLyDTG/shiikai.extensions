"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MangaTVInfo = void 0;
const types_1 = require("@paperback/types");

exports.MangaTVInfo = {
    version: '1.0.0',
    name: 'MangaTV',
    icon: 'icon.png',
    author: 'WiLyDTG',
    authorWebsite: 'https://github.com/WiLyDTG',
    description: 'Extension para leer manga desde mangatv.net',
    contentRating: types_1.ContentRating.MATURE,
    websiteBaseURL: 'https://mangatv.net',
    sourceTags: [
        { text: 'Spanish', type: 'info' },
        { text: 'Manga', type: 'success' }
    ],
    intents: 21
};
