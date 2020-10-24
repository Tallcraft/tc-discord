const Command = require('./Command');
const { MojangAPIConnector, TCApiConnector } = require('../apiConnectors');

module.exports = new Command({
  name: 'areweupdated',
  description: 'Are we on the latest MC version yet?',
  async handler(message) {
    const [proxyVersion, latestMCVersion] = await Promise.all([
      TCApiConnector.getProxyVersion(),
      MojangAPIConnector.getLatestStableMCVersion(),
    ]);

    let str;
    if (proxyVersion === latestMCVersion) {
      str = `YES 🥳\nWe are running the latest Minecraft version \`${latestMCVersion}\`.`;
    } else {
      str = `No ⌛\nThe latest Minecraft version is \`${latestMCVersion}\`, but we are still on \`${proxyVersion}\`.`;
    }

    return message.channel.send(str);
  },
});
