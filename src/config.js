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
  avatarCodeRegex: process.env.AVATAR_CODE_REGEX || /:mc-(\w*):/gm,
  tallcraftApiUri: process.env.TALLCRAFT_API_URI || 'https://api.tallcraft.com',
  tallcraftApiMCProxyId: process.env.TALLCRAFT_API_MC_PROXY_ID || 'global',
  mojangVersionManifestUri: process.env.MOJANG_VERSION_MANIFEST_URI || 'https://launchermeta.mojang.com/mc/game/version_manifest.json',
};
