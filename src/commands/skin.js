const Command = require('./Command');
const { getSkinURL, SKIN_TYPES } = require('../messages');

const skinTypeListForMessage = Object.values(SKIN_TYPES).join(', ');
const skinTypeListForUsage = Object.values(SKIN_TYPES).join('|');

const cmd = new Command({
  name: 'skin',
  description: 'Show a players skin.',
  usage: `<name | uuid> [${skinTypeListForUsage}]`,
  handler(message, args) {
    const [identifier, type] = args;
    if (!identifier) {
      return cmd.printUsage(message);
    }
    if (type && !Object.values(SKIN_TYPES).includes(type)) {
      return message.channel.send(`Invalid skin type. Valid types are \`${skinTypeListForMessage}\`.`);
    }

    const url = getSkinURL(identifier, type || SKIN_TYPES.BODY);
    return message.channel.send(url);
  },
});

module.exports = cmd;
