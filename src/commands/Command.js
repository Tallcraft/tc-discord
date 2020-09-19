const { getHelpCard } = require('../messages');

module.exports = class Command {
  constructor({
    name, description, usage, handler,
  }) {
    this.name = name;
    this.description = description;
    this.usage = usage;
    this.handler = handler;
  }

  printUsage(message) {
    return message.reply(getHelpCard(this));
  }
};
