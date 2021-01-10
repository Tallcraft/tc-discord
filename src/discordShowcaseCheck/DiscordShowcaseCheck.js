class DiscordShowcaseCheck {
  /**
   * @param {String} bypassPermission - Permission to skip check.
   * @param {Boolean} allowIfAttachment - Allow message if attachments exist
   * @param {RegExp} messageRegex - Allow message if message validates against regex
   * @param {String} errorResponse - If set, error response to send when invalid message.
   * @param {Boolean} attemptDM - If errorResponse exists, attempt DMing user first.
   * Will fall back to temp message in channel.
   */
  constructor({ bypassPermission = 'ADMINISTRATOR', allowIfAttachment = false, messageRegex,
    errorResponse, attemptDM = false }) {
    this.bypassPermission = bypassPermission;
    this.allowIfAttachment = allowIfAttachment;
    this.messageRegex = messageRegex;
    this.errorResponse = errorResponse;
    this.DMUser = attemptDM;
  }

  /**
   * Runs check on message and give error if fails
   * @param {Message} message - Discord message to check.
   * @returns {Promise<boolean>} - Resolves when done checking and handling message.
   */
  async handle(message) {
    // If author has permission, skip check
    if (message.member.permissions.has(this.bypassPermission)) {
      return false;
    }
    // Check for attachments
    if (this.allowIfAttachment && message.attachments.size > 0) {
      return false;
    }
    // Check for message regex
    if (this.messageRegex && this.messageRegex.test(message.content)) {
      return false;
    }

    // If here, remove message
    const promises = [];
    if (this.errorResponse) {
      if (this.DMUser) {
        // Add orig message in response (only do if DMed message to prevent spam)
        let DMResponse = `${this.errorResponse}\n\nYour original message:\n\`\`\`${message.content}`;
        if (DMResponse.length > 1990) {
          DMResponse = `${DMResponse.substring(0, 1990)}...`;
        }
        DMResponse += '\n```';

        promises.push(message.author.send(DMResponse)
          .catch(() => message.reply(this.errorResponse)
            .then(
              (tempMessage) => tempMessage.delete({ timeout: 10000 }),
            ).catch((err) => console.log(err))));
      } else {
        promises.push(message.reply(this.errorResponse)
          .then(
            (tempMessage) => tempMessage.delete({ timeout: 10000 }),
          ).catch((err) => console.log(err)));
      }
    }

    promises.push(message.delete({ timeout: 0 }));
    await Promise.allSettled(promises);
    return true;
  }
}

module.exports = DiscordShowcaseCheck;
