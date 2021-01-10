class DiscordShowcaseCheck {
  /**
   * @param {String} bypassPermission - Permission to skip check.
   * @param {Boolean} allowIfAttachment - Allow message if attachments exist
   * @param {RegExp} messageRegex - Allow message if message validates against regex
   * @param {String} invalidMessageResponse - If set, error response to send when invalid message.
   * @param {Boolean} attemptDM - If invalidMessageResponse exists, attempt DMing user first.
   * Will fall back to temp message in channel.
   */
  constructor({ bypassPermission = 'ADMINISTRATOR', allowIfAttachment = false, messageRegex,
    invalidMessageResponse, attemptDM = false }) {
    this.bypassPermission = bypassPermission;
    this.allowIfAttachment = allowIfAttachment;
    this.messageRegex = messageRegex;
    this.invalidMessageResponse = invalidMessageResponse;
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
    if (this.invalidMessageResponse) {
      if (this.DMUser) {
        // Add original message in DM response
        let invalidDMResponse = `${this.invalidMessageResponse}\n\nYour original message:\n\`\`\`${message.content}`;
        // Truncates message to keep message under 2000 characters due to discord message limit
        if (invalidDMResponse.length > 1990) {
          invalidDMResponse = `${invalidDMResponse.substring(0, 1990)}...`;
        }
        invalidDMResponse += '\n```';

        promises.push(message.author.send(invalidDMResponse)
          .catch(() => message.reply(this.invalidMessageResponse)
            .then(
              (tempMessage) => tempMessage.delete({ timeout: 10000 }),
            ).catch((err) => console.error(err))));
      } else {
        promises.push(message.reply(this.invalidMessageResponse)
          .then(
            (tempMessage) => tempMessage.delete({ timeout: 10000 }),
          ).catch((err) => console.error(err)));
      }
    }

    promises.push(message.delete());
    await Promise.allSettled(promises);
    return true;
  }
}

module.exports = DiscordShowcaseCheck;
