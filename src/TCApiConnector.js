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

  /**
   * Get player object from API.
   * @param {String} identifier - Either a valid UUID or a playername.
   * @returns {Promise<Object|null>} - Player object or null if not found.
   */
  async getPlayerInfo(identifier) {
    if (isValidUUID(identifier)) {
      return this.getPlayerInfoByUUID(identifier);
    }
    return this.getPlayerInfoByName(identifier);
  },

  /**
   * Get player object from API by UUID.
   * @param {String} uuid - MC user UUID.
   * @returns {Promise<Object|null>} -Player object or null if not found.
   */
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

  /**
   * Get the version no. of the proxy Minecraft server which acts as the entry point for Minecraft
   * clients.
   * @returns {Promise<String|null>} Version number or null on error.
   */
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

  /**
   * Get array of server info from API. See exported fields below.
   * @returns {Promise<Array|null>} Array or null on error.
   */
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

  /**
   * Get array of server info from API. See exported fields below.
   * @returns {Promise<Array|null>} Array or null on error.
   */
  async getServerConnectionInfo() {
    const result = await client.query({
      query: gql`
          query Servers {
              mcServers {
                  id
                  name
                  version
                  address
              }
          }
      `,
    });

    return result?.data?.mcServers;
  },
};
