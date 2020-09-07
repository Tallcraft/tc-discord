const Discord = require('discord.js');
const moment = require('moment');

function getErrorCard({ title = 'Error', message = 'An unknown error occured.' } = {}) {
  return new Discord.MessageEmbed()
    .setColor('#af0000')
    .setTitle(title)
    .setDescription(message);
}

function getAvatarURL(identifier) {
  return `https://minotar.net/avatar/${identifier}/50`;
}

function getSkinURL(identifier) {
  return `https://minotar.net/armor/body/${identifier}/100`;
}

function getRelativeTimeLabel(timestampStr) {
  let timestamp;
  try {
    timestamp = new Date(Number.parseInt(timestampStr, 10));
  } catch (error) {
    return null;
  }
  return moment(new Date(timestamp)).from(new Date());
}

function getAboutBotCard() {
  return new Discord.MessageEmbed()
    .setTitle('Tallcraft Discord Bot')
    .setDescription("Hi, I'm a Discord bot for Tallcraft. \n I can help you with various things.")
    .setThumbnail('http://img.tallcraft.com/branding/logo144x.png')
    .addField('List Commands', '!tc help')
    .addField('Source Code', 'https://github.com/Tallcraft/tc-discord')
    .addField('Found a Bug? 🐞', 'File it here: https://github.com/Tallcraft/tc-discord/issues');
}

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

function getPlayerCard(player) {
  const msg = new Discord.MessageEmbed()
    .setTitle(player.lastSeenName)
    .setThumbnail(getAvatarURL(player.uuid))
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
    msg.addField('Ranks', player.groups.map((group) => group.id).join(', '));

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

module.exports = {
  getErrorCard, getPlayerCard, getHelpCard, getPlayerListCard, getAboutBotCard,
};
