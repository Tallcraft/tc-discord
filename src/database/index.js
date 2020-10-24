const sqlite3 = require('sqlite3');
const { open } = require('sqlite');

class DBConnector {
  async init() {
    this._sqlite = await open({
      filename: 'storage.sqlite3',
      driver: sqlite3.cached.Database,
    });
  }

  get sqlite() {
    if (!this._sqlite) {
      throw new Error('Not initialized');
    }
    return this._sqlite;
  }
}

module.exports = new DBConnector();
