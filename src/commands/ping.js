const Command = require('./Command');

module.exports = new Command({
  name: 'ping',
  description: '🏓',
  handler(message) {
    message.reply('Pong.');
  },
});
