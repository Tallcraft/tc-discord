const gql = require('graphql-tag');

const fetch = require('node-fetch');
const { createHttpLink } = require('apollo-link-http');
const { InMemoryCache } = require('apollo-cache-inmemory');

const ApolloClient = require('apollo-client').default;

const config = require('./config');
const { isValidUUID } = require('./util');

const client = new ApolloClient({
  link: createHttpLink({
    uri: config.tallcraftApiUri,
    fetch,
  }),
  cache: new InMemoryCache(),
  defaultOptions: {
    query: {
      fetchPolicy: 'network-only',
    },
  },
});

const playerQueryFields = `
    uuid
    lastSeenName
    lastLogin
    firstLogin
    connectedTo {
        name
    }
    groups {
        id
    }
    infractions {
        bans {
            isActive,
            server {
                name
            }
        }
    }
`;

module.exports = {
  async getPlayerInfoByName(name) {
    const result = await client.query({
      query: gql`
          query SearchPlayer($name: String!) {
              players(searchPlayerName: $name) {
                  result {
                      ${playerQueryFields}
                  }
                  totalCount
              }
          }
      `,
      variables: {
        name,
      },
    });

    const data = result?.data?.players;

    // No match
    if (!data || data.totalCount === 0) {
      return null;
    }

    return data.result[0];
  },

  async getPlayerInfo(identifier) {
    if (isValidUUID(identifier)) {
      return this.getPlayerInfoByUUID(identifier);
    }
    return this.getPlayerInfoByName(identifier);
  },

  async getPlayerInfoByUUID(uuid) {
    const result = await client.query({
      query: gql`
          query Player($uuid: ID!) {
              player(uuid: $uuid) {
                  ${playerQueryFields}
              }
          }
      `,
      variables: {
        uuid,
      },
    });

    return result.data.player;
  },

  async getProxyVersion() {
    const result = await client.query({
      query: gql`
          query Server($serverId: String) {
              mcServer(serverId: $serverId) {
                  version
              }
          }
      `,
      variables: {
        serverId: config.tallcraftApiMCProxyId,
      },
    });

    return result?.data?.mcServer?.version;
  },

  async getServerInfo() {
    const result = await client.query({
      query: gql`
          query Servers {
              mcServers {
                  id
                  name
                  status {
                      queryTime
                      onlinePlayers {
                          name
                      }
                      onlinePlayerCount
                      maxPlayerCount
                      isOnline
                  }
              }
          }
      `,
    });

    return result?.data?.mcServers;
  },

  async getServerConnectionInfo() {
    const result = await client.query({
      query: gql`
          query Servers {
              mcServers {
                  id
                  name
                  version
                  publicAddress
              }
          }
      `,
    });

    return result?.data?.mcServers;
  },
};
