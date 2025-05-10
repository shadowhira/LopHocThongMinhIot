const { getDefaultConfig } = require('expo/metro-config');

module.exports = (() => {
  const config = getDefaultConfig(__dirname);

  const { transformer, resolver } = config;

  // Firebase compatibility fixes for Expo SDK 53
  config.resolver.sourceExts.push('cjs');
  config.resolver.unstable_enablePackageExports = false;

  return config;
})();
