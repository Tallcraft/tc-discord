const Discord = require('discord.js');
const moment = require('moment');

/**
 * Creates Discord message card for error messages.
 * @param {String} [title] - Title of error card.
 * @param {String} [message] - Message body.
 * @returns {module:"discord.js".MessageEmbed} - Discord embed message which bot can send.
 */
function getErrorCard({ title = 'Error', message = 'An unknown error occured.' } = {}) {
  return new Discord.MessageEmbed()
    .setColor('#af0000')
    .setTitle(title)
    .setDescription(message);
}

/**
 * Map of supported skin types exposed via Minotar MC Skin API.
 * @type {Readonly<{CUBE: string, BUST: string, SKIN: string, AVATAR: string, BODY: string,
 *                  HELM: string}>}
 */
const SKIN_TYPES = Object.freeze({
  AVATAR: 'avatar',
  HELM: 'helm',
  CUBE: 'cube',
  BODY: 'body',
  BUST: 'bust',
  SKIN: 'skin',
});

/**
 * Get Minotar skin url.
 * @param {String} identifier - Either MC username or UUID of user to get skin URL for.
 * @param {SKIN_TYPES} [type] - Skin type to get URL for.
 * @returns {String} - Skin URL to image matching MC user. If the identifier is invalid / not found
 * the URL will point to the default Minecraft skin.
 */
function getSkinURL(identifier, type = SKIN_TYPES.BODY) {
  const scale = 100;

  // Body and bust type supports showing armor, lets always do that.
  let armorStr = '';
  if (type === SKIN_TYPES.BODY || type === SKIN_TYPES.BUST) {
    armorStr = '/armor/';
  }

  // All types except for skin support a scaling option, set a fixed scale.
  let scaleStr = '';
  if (type !== SKIN_TYPES.SKIN) {
    scaleStr = `/${scale}`;
  }
  return `https://minotar.net/${armorStr}${type}/${identifier}${scaleStr}`;
}

/**
 * Converts a UNIX timestamp to a relative, natural language time label.
 * @param {String} timestampStr - Unix timestamp as a string.
 * @returns {string|null} Relative time label as a string or null if unable to parse.
 */
function getRelativeTimeLabel(timestampStr) {
  let timestamp;
  try {
    timestamp = new Date(Number.parseInt(timestampStr, 10));
  } catch (error) {
    return null;
  }
  return moment(new Date(timestamp)).from(new Date());
}

/**
 * Get a Discord message card showing information about the bot.
 * @returns {module:"discord.js".MessageEmbed} Discord embed message which bot can send.
 */
function getAboutBotCard() {
  return new Discord.MessageEmbed()
    .setTitle('Tallcraft Discord Bot')
    .setDescription("Hi, I'm a Discord bot for Tallcraft. \n I can help you with various things.")
    .setThumbnail('http://img.tallcraft.com/branding/logo144x.png')
    .addField('List Commands', '!tc help')
    .addField('Source Code', 'https://github.com/Tallcraft/tc-discord')
    .addField('Found a Bug? 🐞', 'File it here: https://github.com/Tallcraft/tc-discord/issues');
}

/**
 * Get a Discord message card showing the list of servers and their connection addresses.
 * @param {Array} servers - Server data array as queried through the API.
 * @param {boolean} warnVersion - Whether to warn the user that the server might be outdated.
 * @returns {module:"discord.js".MessageEmbed} Discord embed message which bot can send.
 */
function getConnectionInfoCard(servers, warnVersion) {
  const connectionTutorialURL = 'https://forum.tallcraft.com/t/how-to-connect-to-our-minecraft-server/30';

  let description = `Here is a list of our servers and their connection addresses and Minecraft version required to play.\nA tutorial on how to connect:\n ${connectionTutorialURL}`;
  if (warnVersion) {
    description += '\n\n**Note:** The servers are currently not running on the latest MC version. Make sure to set your game to match the server version shown below.';
  }

  const msg = new Discord.MessageEmbed()
    .setTitle('How to Connect 📶')
    .setDescription(description)
    .setURL(connectionTutorialURL);

  servers.forEach((server) => {
    msg.addField(`${server.name} \`v${server.version}\``, `\`${server.address}\``);
  });

  return msg;
}

/**
 * Get a Discord message card showing a list of servers with the names of online players.
 * @param {Array} servers - Server dat array as queried through the API.
 * @returns {module:"discord.js".MessageEmbed} Discord embed message which bot can send.
 */
function getPlayerListCard(servers) {
  const msg = new Discord.MessageEmbed()
    .setTitle('Tallcraft Network - Player List 🎮');

  servers.forEach((server) => {
    // Proxy does not expose player list as of now.
    if (server.id === 'global' || !server.status.isOnline) {
      return;
    }
    const playerList = server.status.onlinePlayers;
    let playerListStr = '';

    if (!playerList?.length) {
      playerListStr = ' -';
    } else {
      playerListStr = playerList.map((player) => player.name).join(', ');
    }

    const fieldTitle = `${server.name} \`[${server.status.onlinePlayerCount}/${server.status.maxPlayerCount}]\``;
    const fieldBody = `\`\`\`${playerListStr}\`\`\``;

    msg.addField(fieldTitle, fieldBody);
  });

  return msg;
}

/**
 * Get a Discord message card showing a player profile.
 * @param player - Player object as queried through the API.
 * @returns {module:"discord.js".MessageEmbed} Discord embed message which bot can send.
 */
function getPlayerCard(player) {
  const msg = new Discord.MessageEmbed()
    .setTitle(Discord.escapeMarkdown(player.lastSeenName))
    .setThumbnail(getSkinURL(player.uuid, SKIN_TYPES.HELM))
    .setImage((getSkinURL(player.uuid)))
    .setTimestamp()
    .setFooter('Data from api.tallcraft.com.');

  if (player.uuid) {
    msg.addField('UUID', `\`${player.uuid}\``);
  }

  if (player.connectedTo !== undefined) {
    msg.addField('Status', player.connectedTo ? '🟢 Online' : '🔴 Offline');
  }

  if (player.firstLogin) {
    msg.addField('First Login 🗓️', getRelativeTimeLabel(player.firstLogin) || 'unknown');
  }

  if (player.lastLogin) {
    msg.addField('Last Login 🗓️', getRelativeTimeLabel(player.lastLogin) || 'unknown');
  }

  if (player.groups) {
    msg.addField('Ranks', player.groups.map((group) => group.id).join(', ') || '-');

    // VIPs get a golden border highlight
    if (player.groups.some((group) => group.id === 'vip')) {
      msg.setColor('#f39600');
    }

    // Staff get a red border highlight
    if (player.groups.some((
      (group) => group.id === 'moderator' || group.id === 'admin' || group.id === 'owner'))) {
      msg.setColor('#ff0000');
    }
  }

  if (player.infractions?.bans != null) {
    const activeBanServers = player.infractions.bans
      .filter((ban) => ban.isActive)
      .map((ban) => ban.server.name);
    const isBanned = activeBanServers.length;
    msg.addField('Ban Status', isBanned
      ? `Banned from: \`${activeBanServers.join(', ')}\`` : 'Not banned');
  }

  return msg;
}

/**
 * Get a Discord message card showing a list of registered bot command and their usage+description.
 * @param {Command[]}commands - Array of registered bot commands.
 * @returns {module:"discord.js".MessageEmbed} Discord embed message which bot can send.
 */
function getHelpCard(commands) {
  const msg = new Discord.MessageEmbed();

  let cmdArray = commands;

  // Single command
  if (!(commands instanceof Map)) {
    cmdArray = [cmdArray];
  }

  if (cmdArray.length === 1) {
    msg.setTitle('Command Help');
  } else {
    msg.setTitle('Tallcraft Bot Commands')
      .setDescription('List of available commands:');
  }

  cmdArray.forEach((cmd) => {
    let fieldBody = `${cmd.description}`;
    if (cmd.usage) {
      fieldBody += `\n\`${cmd.name} ${cmd.usage}\``;
    }
    msg.addField(cmd.name, fieldBody);
  });

  return msg;
}

/**
 * Get Discord message card showing the online status for a MC server.
 * @param {Object} server - Server object with name and online status.
 * @returns {module:"discord.js".MessageEmbed} - Discord embed message which bot can send.
 */
function getServerStatusCard(server) {
  let statusEmoji;
  let statusKeyword;

  if (server.status.isOnline) {
    statusEmoji = ':green_circle:';
    statusKeyword = 'online';
  } else {
    statusEmoji = ':red_circle:';
    statusKeyword = 'offline';
  }
  return new Discord.MessageEmbed()
    .setTitle(`Server Status  ${statusEmoji}`)
    .setDescription(`**${server.name}** just went **${statusKeyword}**.`)
    .setTimestamp();
}

module.exports = {
  getErrorCard,
  getPlayerCard,
  getHelpCard,
  getPlayerListCard,
  getAboutBotCard,
  getConnectionInfoCard,
  SKIN_TYPES,
  getSkinURL,
  getServerStatusCard,
};
