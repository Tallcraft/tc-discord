const Command = require('./Command');
const { getConnectionInfoCard, getErrorCard } = require('../messages');
const api = require('../TCApiConnector');

module.exports = new Command({
  name: 'connect',
  description: 'Shows connection details for the servers.',
  async handler(message) {
    const servers = await api.getServerConnectionInfo();

    if (!servers) {
      return message.channel.send(getErrorCard({
        message: 'Could not fetch server info.',
      }));
    }
    return message.channel.send(getConnectionInfoCard(servers));
  },
});
