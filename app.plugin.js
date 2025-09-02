// Expo config plugin to enable cleartext (HTTP / WS) traffic on Android.
// TEMPORARY workaround until the backend is switched to HTTPS/WSS.
// Adds android:usesCleartextTraffic="true" to the <application> tag.

const { withAndroidManifest } = require('@expo/config-plugins');

function setUsesCleartextTraffic(androidManifest) {
  const app = androidManifest.manifest.application && androidManifest.manifest.application[0];
  if (app) {
    app.$['android:usesCleartextTraffic'] = 'true';
  }
  return androidManifest;
}

const withAllowCleartext = (config) => {
  return withAndroidManifest(config, (config) => {
    config.modResults = setUsesCleartextTraffic(config.modResults);
    return config;
  });
};

module.exports = withAllowCleartext;
