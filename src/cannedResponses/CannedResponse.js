class CannedResponse {
  /**
   * @param {RegExp} triggerRegex - Regex to check when @link{handle} is called.
   * @param {String} responseStr - Message to reply to user when regex matches.
   * @param {Command} executeCommand - Command to exectue when regex matches.
   */
  constructor(triggerRegex, { responseStr, executeCommand }) {
    this.triggerRegex = triggerRegex;

    if (!responseStr && !executeCommand) {
      throw new Error('Either responseStr or command handler is required');
    }
    this.response = responseStr;
    this.command = executeCommand;
  }

  /**
   * Checks if message matches regex and replies to user and/or execute configured command.
   * @param {Message} message - Discord message to check.
   * @returns {Promise<boolean>} - Resolves when reply message was sent and command has been
   * executed. If the regex does not match the message it returns instantly.
   * Returns true if message matches regex and was handled, false otherwise.
   */
  async handle(message) {
    if (!this.triggerRegex.test(message.content)) {
      return false;
    }

    // We can handle this.
    const promises = [];
    if (this.response) {
      promises.push(message.reply(this.response));
    }
    if (this.command) {
      promises.push(this.command.handler(message));
    }

    await Promise.allSettled(promises);
    return true;
  }
}

module.exports = CannedResponse;
