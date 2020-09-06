const Discord = require('discord.js');
const fs = require('fs');

const config = require('./config');

let discordClient;

// FIXME: Check if username is valid / avatar source has an avatar
// TODO: publish to docker registry and use in tc-docker compose

async function commandHandler(message) {
  console.debug('cmd> ', message.content);
  message.reply('Sorry I don\'t support commands yet, but I will in the future!');
}

function getAvatarURL(mcUsername) {
  return `https://minotar.net/avatar/${mcUsername}/50`;
}

async function chatHandler(message) {
  console.debug('msg> ', message.content);

  const matches = message.content.matchAll(config.avatarCodeRegex);

  if (!matches) {
    return;
  }

  // Index 1 for a match is the first group matched.
  const avatarURLs = Array.from(matches).map((match) => getAvatarURL(match[1]));

  // We can't send all the avatar urls in one message. Discord only hides the image src url
  // if we send them one by one.
  avatarURLs.forEach((url) => {
    message.channel.send(url);
  });
}

async function onReady() {
  console.info(`Logged in as ${discordClient.user.tag}!`);

  const appId = process.env.DISCORD_APP_ID;
  if (appId) {
    console.info(
      `Add this bot to a server: https://discordapp.com/oauth2/authorize?client_id=${appId}&scope=bot`,
    );
  }
}

process.on('SIGINT', () => {
  process.exit();
});

(async () => {
  discordClient = new Discord.Client();

  discordClient.on('error', (e) => console.error(e));
  discordClient.on('warn', (e) => console.warn(e));
  discordClient.on('ready', onReady);
  discordClient.on('message', (message) => {
    if (message.author.bot || !message.guild) {
      return;
    }

    if (message.content.startsWith(config.commandPrefix)) {
      commandHandler(message);
      return;
    }

    chatHandler(message);
  });

  discordClient.login(config.botToken)
    .catch((error) => {
      console.error('Error authenticating with Discord! Check your internet connection and bot token.',
        error.message);
      console.debug(error);
      process.exit(1);
    });
})();
