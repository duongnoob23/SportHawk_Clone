const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add .md files to the asset extensions
config.resolver.assetExts.push('md');

module.exports = config;
