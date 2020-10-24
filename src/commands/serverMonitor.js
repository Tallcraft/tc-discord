const Command = require('./Command');
const MCServerMonitor = require('../mcServerMonitor');

const cmd = new Command({
  name: 'monitor',
  description: 'Subscribe channels to MC server status notifications.',
  permission: 'ADMINISTRATOR',
  usage: '<subscribe|unsubscribe> [channelId]',
  handler(message, args) {
    const [subscribe, channelId] = args;

    if ((subscribe !== 'subscribe' && subscribe !== 'unsubscribe')) {
      cmd.printUsage(message);
      return;
    }

    const shouldSubcribe = subscribe === 'subscribe';

    let channel;
    const keyword = shouldSubcribe ? 'Enabled' : 'Disabled';
    if (shouldSubcribe) {
      channel = MCServerMonitor.subscribe(channelId || message.channel.id);
    } else {
      channel = MCServerMonitor.unsubscribe(channelId || message.channel.id);
    }

    message.channel.send(`${keyword} server status updates for channel ${channel}.`);
  },
});

module.exports = cmd;
