const { getHelpCard } = require('../messages');

module.exports = class Command {
  /**
   * @callback commandHandler
   * @param {module:"discord.js".Message} message - Discord message of the command sent by the user.
   * @param {String[]} args - Arguments parsed from the message.
   */

  /**
   * Create a new bot command.
   * @param {String} name - Name of the command, used as key.
   * @param {String} description - Human readable description.
   * @param {String} usage - Usage string explaining the command args.
   * @param {String} [permission] - Permission level needed to run command.
   * Defaults to everyone.
   * @param {commandHandler} handler - Function which handles incoming cmd calls.
   */
  constructor({
    name, description, usage, handler, permission,
  }) {
    this.name = name;
    this.description = description;
    this.usage = usage;
    this.handler = handler;
    this.permission = permission;

    this.noPermissionMessage = "You don't have permission to use this command";
  }

  /**
   * React to user message with command usage string in a Discord MessageEmbed.
   * @param {module:"discord.js".Message} message - Message to react to.
   * @returns {Promise} - Promise which resolves with the sent message.
   */
  printUsage(message) {
    if (!this.hasPermission(message.member)) {
      message.reply(this.noPermissionMessage);
    }
    return message.reply(getHelpCard(this));
  }

  /**
   * Check whether a user has permission to run a command.
   * @param {module:"discord.js".GuildMember} member - Discord guild member.
   * @returns {boolean} - True if user has permission, false otherwise.
   */
  hasPermission(member) {
    if (!this.permission) {
      return true;
    }
    return member.hasPermission(this.permission);
  }

  /**
   * Run the command. Will message user with error if they don't have permission.
   * @param {module:"discord.js".GuildMember} message - Message that triggered the command.
   * @param {string[]} args - Command arguments derived from message content.
   * Excluding command keyword.
   * @returns {Promise} - Resolves once the command has been handled.
   */
  run(message, args) {
    if (!this.hasPermission(message.member)) {
      message.reply(this.noPermissionMessage);
      return undefined;
    }
    return this.handler(message, args);
  }
};
