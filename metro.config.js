const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add support for WebAssembly (.wasm), SQLite files, and Font files (.ttf, .otf)
config.resolver.assetExts.push('wasm', 'db', 'ttf', 'otf');

module.exports = config;
