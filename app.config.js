const { withAndroidManifest } = require('@expo/config-plugins');

module.exports = ({ config }) => {
  return withAndroidManifest(config, config => {
    const application = config.modResults.manifest.application[0];
    application['meta-data'] = application['meta-data'] || [];

    // Add Google Pay meta-data
    application['meta-data'].push({
      $: {
        'android:name': 'com.google.android.gms.wallet.api.enabled',
        'android:value': 'true',
      },
    });

    return config;
  });
};
