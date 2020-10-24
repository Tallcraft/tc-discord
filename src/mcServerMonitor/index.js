const { TCApiConnector } = require('../apiConnectors');
const { getServerStatusCard } = require('../messages');

// TODO: persistence, file?
class MCServerMonitor {
  init(discordClient) {
    this._client = discordClient;
    this._servers = new Map();
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
    const channel = this._getChannelById(channelId);
    this._subscribedChannels.add(channel);

    // Added the first subscriber, register listener
    if (this._subscribedChannels.size === 1) {
      TCApiConnector.onlineStatusObserver.on('update', this._onServerStatusUpdate.bind(this));
    }
  }

  unsubscribe(channelId) {
    const channel = this._getChannelById(channelId);
    this._subscribedChannels.delete(channel);

    // Removed the last subscriber, remove the listener.
    if (!this._subscribedChannels.size) {
      TCApiConnector.onlineStatusObserver.removeListener(this._onServerStatusUpdate.bind(this));
    }
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
    const oldServer = this._servers.get(server.id);
    if (!oldServer || oldServer.status.isOnline !== server.status.isOnline) {
      this._notifyChannels(server);
    }
    this._servers.set(server.id, server);
  }
}

module.exports = new MCServerMonitor();
