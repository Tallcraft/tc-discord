const Discord = require('discord.js');

const commands = require('./commands');
const { getHelpCard } = require('./messages');
const config = require('./config');

let discordClient;

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

  // Register commands
  discordClient.commands = new Discord.Collection();
  commands.forEach((cmd) => discordClient.commands.set(cmd.name, cmd));

  discordClient.on('error', (e) => console.error(e));
  discordClient.on('warn', (e) => console.warn(e));
  discordClient.on('ready', onReady);
  discordClient.on('message', (message) => {
    if (!message.content.startsWith(config.commandPrefix) || message.author.bot) return;

    const args = message.content.slice(config.commandPrefix.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    // If only base command is supplied print help.
    if (!command.length || !discordClient.commands.has(command)) {
      message.channel.send(getHelpCard(discordClient.commands));
      return;
    }

    try {
      discordClient.commands.get(command).handler(message, args);
    } catch (error) {
      console.error(error);
      message.reply('There was an error trying to execute that command!');
    }
  });

  discordClient.login(config.botToken)
    .catch((error) => {
      console.error('Error authenticating with Discord! Check your internet connection and bot token.',
        error.message);
      console.debug(error);
      process.exit(1);
    });
})();
