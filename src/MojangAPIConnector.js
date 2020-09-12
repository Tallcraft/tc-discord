const fetch = require('node-fetch');
const config = require('./config');

const errorInvalidVersionInfo = new Error('Received invalid version info from Mojang');

module.exports = {
  async getLatestStableMCVersion() {
    const response = await fetch(config.mojangVersionManifestUri);
    if (!response.ok) {
      throw new Error('Error while fetching version info from Mojang.');
    }

    let versionInfo;
    try {
      versionInfo = await response.json();
    } catch (error) {
      console.error(error);
      versionInfo = null;
    }

    const versionNo = versionInfo?.latest?.release;
    if (!versionNo) {
      throw errorInvalidVersionInfo;
    }

    return versionNo;
  },
};
