const Command = require('./Command');
const { getAboutBotCard } = require('../messages');

module.exports = new Command({
  name: 'about',
  description: 'Shows info about the bot.',
  handler(message) {
    message.channel.send(getAboutBotCard());
  },
});
