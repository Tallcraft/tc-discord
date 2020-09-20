class CannedResponse {
  constructor(triggerRegex, { responseStr, executeCommand }) {
    this.triggerRegex = triggerRegex;

    if (!responseStr && !executeCommand) {
      throw new Error('Either responseStr or command handler is required');
    }
    this.response = responseStr;
    this.command = executeCommand;
  }

  handle(message) {
    if (!this.triggerRegex.test(message.content)) {
      return false;
    }

    // We can handle this.
    if (this.response) {
      message.reply(this.response);
    }
    if (this.command) {
      this.command.handler(message);
    }
    return true;
  }
}

module.exports = CannedResponse;
