const ChannelMonitor = require('./DiscordChannelMonitor.js');

const channelMonitors = [
  // Showcase channel restrictions
  new ChannelMonitor('784136817171628093',
    'Invalid message. You may only send files or messages starting with http(s) links'
    + ' including an optional short descriptions in this channel', true),
];

module.exports = {
  /**
   * Check message and execute matching discordChannelMonitor handlers.
   * @param {Message} message - Discord message to check and reply to if matching.
   * @returns {Promise<boolean>} Resolves once all CannedResponse handlers have either handled or
   * skipped the message. Returns true if at least one CannedResponse handled the message.
   */
  async handle(message) {
    const jobs = channelMonitors.map((channel) => channel.handle(message));
    const results = await Promise.allSettled(jobs);
    return results.some((result) => result.value);
  },
};
