const Command = require('./Command');
const { getConnectionInfoCard, getErrorCard } = require('../messages');
const api = require('../TCApiConnector');
const mojangAPI = require('../MojangAPIConnector');

module.exports = new Command({
  name: 'connect',
  description: 'Shows connection details for the servers.',
  async handler(message) {
    // The server query must succeed.
    // If the version query does not succeed, we just don't show a version warning.
    const [servers, latestMCVersion] = await Promise.allSettled([api.getServerConnectionInfo(),
      mojangAPI.getLatestStableMCVersion()]);

    if (servers.status !== 'fulfilled' || !servers.value) {
      return message.channel.send(getErrorCard({
        message: 'Could not fetch server info.',
      }));
    }

    let warnVersion = false;
    const mcProxyServer = servers.value.find((server) => server.id === 'global');
    if (mcProxyServer && latestMCVersion.value) {
      warnVersion = mcProxyServer.version !== latestMCVersion.value;
    }

    return message.channel.send(getConnectionInfoCard(servers.value, warnVersion));
  },
});
