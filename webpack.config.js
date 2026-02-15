const path = require('path');

module.exports = {
    mode: 'production',
    entry: './0.8/MangaTV/index.js',
    output: {
        path: path.resolve(__dirname, '0.8/MangaTV'),
        filename: 'index.bundle.js',
        library: {
            name: 'Sources',
            type: 'umd',
            export: 'default'
        },
        globalObject: 'this'
    },
    resolve: {
        extensions: ['.js']
    },
    target: ['web', 'es5']
};
