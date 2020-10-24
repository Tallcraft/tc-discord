const Command = require('./Command');
const { getErrorCard, getPlayerCard } = require('../messages');
const { TCApiConnector } = require('../apiConnectors');

const cmd = new Command({
  name: 'lookup',
  description: 'Search for player profiles.',
  usage: '<name | uuid>',
  async handler(message, args) {
    if (!args.length) {
      cmd.printUsage(message);
    }
    const player = await TCApiConnector.getPlayerInfo(args[0]);

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
