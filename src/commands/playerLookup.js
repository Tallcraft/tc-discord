const Command = require('./Command');
const { getErrorCard, getPlayerCard } = require('../messages');
const api = require('../TCApiConnector');

const cmd = new Command({
  name: 'lookup',
  description: 'Search for player profiles.',
  usage: '<name | uuid>',
  async handler(message, args) {
    if (!args.length) {
      cmd.printUsage(message);
    }
    const player = await api.getPlayerInfo(args[0]);

    if (!player) {
      return message.channel.send(getErrorCard({
        title: 'Not Found',
        message: `Could not find player "${args[0]}".`,
      }));
    }
    return message.channel.send(getPlayerCard(player));
  },
});

module.exports = cmd;
