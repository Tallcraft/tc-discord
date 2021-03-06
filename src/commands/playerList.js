const Command = require('./Command');
const { getErrorCard, getPlayerListCard } = require('../messages');
const { TCApiConnector } = require('../apiConnectors');

const cmd = new Command({
  name: 'list',
  description: 'Shows a list of online players.',
  async handler(message) {
    const servers = await TCApiConnector.getServerInfo();

    if (!servers) {
      return message.channel.send(getErrorCard({
        message: 'Could not fetch server info.',
      }));
    }
    return message.channel.send(getPlayerListCard(servers));
  },
});

module.exports = cmd;
