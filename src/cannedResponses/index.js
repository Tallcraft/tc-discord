const CannedResponse = require('./CannedResponse');
const connect = require('../commands/connect');
const playerList = require('../commands/playerList');
const areweupdated = require('../commands/areweupdated');

const responses = [
  new CannedResponse(
    new RegExp('(what.*(?:ip|address))|((?:how|can(?:not|\'t)).*connect)', 'i'),
    { executeCommand: connect },
  ),
  new CannedResponse(
    new RegExp('(is.+server.+(?:offline|down))|(who.*online)|(playerlist)|(any(?:body|one).+playing)', 'i'),
    { executeCommand: playerList },
  ),
  new CannedResponse(
    new RegExp('((?:is tallcraft)|(?:are\\s+we\\s+on).*[1-9]+.[0-9]+.[0-9]+)|(what.*version)|(are\\s+we\\s+updated)|(did.*server.*update)', 'i'),
    { executeCommand: areweupdated },
  ),
  new CannedResponse(
    new RegExp('(unban\\s+me)|(can\\s+you\\s+unban)|(how\\s+(?:(do\\s+I)|(to))\\s+dispute)|(I\\s+be\\s+unbanned)', 'i'),
    { responseStr: 'You can view and create ban disputes here: https://forum.tallcraft.com/c/5' },
  ),
  new CannedResponse(
    new RegExp('who.*likes\\s+potatoes', 'i'),
    { responseStr: 'Me! 🥔 (Don\'t tell Nix)' },
  ),
];

module.exports = {
  async handle(message) {
    const jobs = responses.map((response) => response.handle(message));
    const results = await Promise.allSettled(jobs);
    return results.some((result) => result.value);
  },
};
