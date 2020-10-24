const { TCApiConnector } = require('../apiConnectors');
const { getServerStatusCard } = require('../messages');
const DBConnector = require('../database');

class MCServerMonitor {
  async init(discordClient) {
    this._client = discordClient;
    this._subscribedChannels = new Set();

    // Initialize persistence
    await DBConnector.init();
    await DBConnector.sqlite.exec('CREATE TABLE IF NOT EXISTS ServerStatusSubscribers (channelId UNIQUE PRIMARY KEY)');

    // Import subscribed channels
    const result = await DBConnector.sqlite.all('SELECT channelId from ServerStatusSubscribers');
    result.map((r) => r.channelId).forEach((id) => this.subscribe(id, false));
  }

  _getChannelById(id) {
    const channel = this._client.channels.cache.get(id);
    if (!channel) {
      throw new Error(`Could not get channel for id '${id}'`);
    }
    return channel;
  }

  subscribe(channelId, persist = true) {
    if (!this._client) {
      throw new Error('Not initialized');
    }

    const channel = this._getChannelById(channelId);

    // Already subscribed
    if (this._subscribedChannels.has(channel)) {
      return channel;
    }

    this._subscribedChannels.add(channel);

    // Added the first subscriber, register listener
    if (this._subscribedChannels.size === 1) {
      TCApiConnector.onlineStatusObserver.on('update', this._onServerStatusUpdate.bind(this));
    }

    if (persist) {
      // Update storage async
      DBConnector.sqlite.run('INSERT INTO ServerStatusSubscribers(channelId) VALUES(?)', [channel.id]);
    }

    return channel;
  }

  unsubscribe(channelId) {
    if (!this._client) {
      throw new Error('Not initialized');
    }

    const channel = this._getChannelById(channelId);

    // Not subscribed
    if (!this._subscribedChannels.has(channel)) {
      return channel;
    }

    this._subscribedChannels.delete(channel);

    // Removed the last subscriber, remove the listener.
    if (!this._subscribedChannels.size) {
      TCApiConnector.onlineStatusObserver
        .removeListener('update', this._onServerStatusUpdate.bind(this));
    }

    // Update storage async
    DBConnector.sqlite.run('DELETE FROM ServerStatusSubscribers WHERE channelId=?', channel.id);

    return channel;
  }

  _notifyChannels(server) {
    const message = getServerStatusCard(server);
    this._subscribedChannels.forEach((channel) => {
      channel.send(message);
    });
  }

  _onServerStatusUpdate(server) {
    if (!server) {
      throw new Error('Invalid server data from API');
    }
    this._notifyChannels(server);
  }
}

module.exports = new MCServerMonitor();
