const ping = require('./ping');
const playerLookup = require('./playerLookup');
const playerList = require('./playerList');
const about = require('./about');
const connect = require('./connect');
const areweupdated = require('./areweupdated');
const skin = require('./skin');
const rules = require('./rules');
const serverMonitor = require('./serverMonitor');

module.exports = [
  ping,
  playerLookup,
  playerList,
  about,
  connect,
  areweupdated,
  skin,
  rules,
  serverMonitor,
];
