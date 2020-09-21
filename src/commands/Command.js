const { getHelpCard } = require('../messages');

module.exports = class Command {
  /**
   * @callback commandHandler
   * @param {Message} message - Discord message of the command sent by the user.
   * @param {String[]} args - Arguments parsed from the message.
   */

  /**
   * Create a new bot command.
   * @param {String} name - Name of the command, used as key.
   * @param {String} description - Human readable description.
   * @param {String} usage - Usage string explaining the command args.
   * @param {commandHandler} handler - Function which handles incoming cmd calls.
   */
  constructor({
    name, description, usage, handler,
  }) {
    this.name = name;
    this.description = description;
    this.usage = usage;
    this.handler = handler;
  }

  /**
   * React to user message with command usage string in a Discord MessageEmbed.
   * @param {Message} message - Message to react to.
   * @returns {Promise} - Promise which resolves with the sent message.
   */
  printUsage(message) {
    return message.reply(getHelpCard(this));
  }
};
