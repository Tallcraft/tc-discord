class DiscordChannelMonitor {
  /**
   * @param {String} channel - Channel that is monitored
   * @param {String} responseStr - Message to reply to user when not a showcase.
   * @param {Boolean} deleteMessage - Delete original message.
   */
  constructor(channel, responseStr, deleteMessage) {
    this.channel = channel;
    this.response = responseStr;
    this.deleteMessage = deleteMessage;
  }

  /**
   * Checks if message is in channel, and if so, should it stay or be removed.
   * @param {Message} message - Discord message to check.
   * @returns {Promise<boolean>} - Resolves when reply message was sent in channel.
   */
  async handle(message) {
    if (!(message.channel.id === this.channel)) {
      return false;
    }

    // If in channel, determine if valid message
    let isValid = false;
    if (message.attachments.size > 0) {
      isValid = true;
    }
    if (new RegExp('^https?:\\/\\/(www\\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\\.[a-zA-Z0-9()]{1,25}').test(message.content)) {
      isValid = true;
    }
    if (message.content.length > 500) {
      isValid = false;
    }
    if (message.member.permissions.has('MANAGE_MESSAGES')) {
      isValid = true;
    }
    if (isValid) {
      return false;
    }

    // We can handle this.
    const promises = [];
    if (this.response) {
      promises.push(message.reply(this.response)
        .then(
          (tempMessage) => tempMessage.delete({ timeout: 5000 }),
        )
        .catch((err) => console.log(err)));
    }
    if (this.deleteMessage) {
      promises.push(message.delete({ timeout: 0 }));
    }
    await Promise.allSettled(promises);
    return true;
  }
}

module.exports = DiscordChannelMonitor;
