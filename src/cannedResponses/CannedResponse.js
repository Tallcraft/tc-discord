class CannedResponse {
  constructor(triggerRegex, { responseStr, executeCommand }) {
    this.triggerRegex = triggerRegex;

    if (!responseStr && !executeCommand) {
      throw new Error('Either responseStr or command handler is required');
    }
    this.response = responseStr;
    this.command = executeCommand;
  }

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
