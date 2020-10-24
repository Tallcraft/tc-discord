const EventEmitter = require('events');
const gql = require('graphql-tag');

// Event emitter used for listening for server online status changes.
class OnlineStatusObserver extends EventEmitter {
  constructor(apolloClient) {
    super();

    this._apolloClient = apolloClient;
    this.on('newListener', (event) => this._onNewListener(event));
    this.on('removeListener', (event) => this._onRemoveListener(event));
  }

  _onNewListener(event) {
    if (event !== 'update' || this.listenerCount('update') >= 1) {
      return;
    }
    // First listener for 'update'
    if (!this._observer) {
      this._observer = this._apolloClient.subscribe({
        query: gql`
            subscription ServerOnlineStatusUpdated {
                serverOnlineStatusUpdated {
                    name
                    status {
                        isOnline
                    }
                }
            }
        `,
      });
    }
    this._observer.subscribe((server) => {
      if (!server?.data?.serverOnlineStatusUpdated) {
        throw new Error('Invalid server data from API');
      }
      this.emit('update', server.data.serverOnlineStatusUpdated);
    });
  }

  _onRemoveListener(event) {
    if (event !== 'update' || this.listenerCount('update') > 0) {
      return;
    }
    // No more listeners for 'update'
    this._observer.unsubscribe();
  }
}

module.exports = OnlineStatusObserver;
