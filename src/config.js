const fs = require('fs');

// Get config from env
let botToken = process.env.DISCORD_BOT_TOKEN;

if (!botToken) {
  const tokenFilePath = process.env.DISCORD_BOT_TOKEN_FILE;

  if (!tokenFilePath) {
    throw new Error('Missing bot token. Pass it via ENV');
  }
  // Bot token is passed in via a file. Read it.
  // This enables support for docker secrets.
  botToken = fs.readFileSync(tokenFilePath, 'utf8').trim();
}

module.exports = {
  botToken,
  commandPrefix: process.env.COMMAND_PREFIX || '!tc',
  tallcraftApiUri: process.env.TALLCRAFT_API_URI || 'https://api.tallcraft.com',
  tallcraftApiUriWS: process.env.TALLCRAFT_API_URI_WS || 'wss://api.tallcraft.com/graphql',
  tallcraftApiMCProxyId: process.env.TALLCRAFT_API_MC_PROXY_ID || 'global',
  mojangVersionManifestUri: process.env.MOJANG_VERSION_MANIFEST_URI || 'https://launchermeta.mojang.com/mc/game/version_manifest.json',
  serverStatusChannelId: process.env.SERVER_STATUS_FEED_CHANNEL_ID,
  discordShowcaseChannelId: process.env.DISCORD_SHOWCASE_CHANNEL_ID,
};
