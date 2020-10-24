const { TCApiConnector } = require('../apiConnectors');
const { getServerStatusCard } = require('../messages');

// TODO: persistence, file?
class MCServerMonitor {
  init(discordClient) {
    this._client = discordClient;
    this._subscribedChannels = new Set();
  }

  _getChannelById(id) {
    const channel = this._client.channels.cache.get(id);
    if (!channel) {
      throw new Error(`Could not get channel for id '${id}'`);
    }
    return channel;
  }

  subscribe(channelId) {
    if (!this._client) {
      throw new Error('Not initialized');
    }

    const channel = this._getChannelById(channelId);
    this._subscribedChannels.add(channel);

    // Added the first subscriber, register listener
    if (this._subscribedChannels.size === 1) {
      TCApiConnector.onlineStatusObserver.on('update', this._onServerStatusUpdate.bind(this));
    }

    return channel;
  }

  unsubscribe(channelId) {
    if (!this._client) {
      throw new Error('Not initialized');
    }

    const channel = this._getChannelById(channelId);
    this._subscribedChannels.delete(channel);

    // Removed the last subscriber, remove the listener.
    if (!this._subscribedChannels.size) {
      TCApiConnector.onlineStatusObserver
        .removeListener('update', this._onServerStatusUpdate.bind(this));
    }

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
