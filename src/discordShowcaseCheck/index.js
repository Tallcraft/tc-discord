/**
 * Enables message filtering for showcase channel(s) for requirements like attachments or URLs
 */
const DiscordShowcaseCheck = require('./DiscordShowcaseCheck.js');
const config = require('../config');

/**
 * Map of channel ID and appropriate channel filter - uses config to set up channel that only allows
 * messages with attachments or start with http(s) urls.
 * @type {Map<String,DiscordShowcaseCheck>}
 */
const showcaseChannels = new Map();
showcaseChannels.set(config.discordShowcaseChannelId, new DiscordShowcaseCheck({
  bypassPermission: 'MANAGE_MESSAGES',
  allowIfAttachment: true,
  messageRegex: new RegExp('^https?:\\/\\/(www\\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\\.[a-zA-Z0-9()]{1,25}'),
  invalidMessageResponse: `Invalid message. You may only send files or messages starting with http(s) links in <#${config.discordShowcaseChannelId}>.`,
  attemptDM: true,
}));

module.exports = {
  /**
   * Check message and execute matching discordShowcaseCheck handlers.
   * @param {Message} message - Discord message to check and reply to if matching.
   * @returns {Promise<boolean>} Resolves once discordShowcaseCheck handler have either handled or
   * skipped the message. Returns true if at least one discordShowcaseCheck handled the message.
   */
  async handle(message) {
    return showcaseChannels.get(message.channel.id).handle(message);
  },

  /**
   * Check if channel ID is a showcase ID
   * @param {String} channelId - Channel ID
   * @return {Boolean} isShowcase - return if channel is showcase
   */
  isShowcase(channelId) {
    return showcaseChannels.has(channelId);
  },
};
