const Command = require('./Command');

module.exports = new Command({
  name: 'rules',
  description: 'Shows the Tallcraft community rules.',
  handler(message) {
    return message.channel.send('Our community rules: https://forum.tallcraft.com/t/336');
  },
});
