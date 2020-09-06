const fetch = require('node-fetch');
const AbortController = require('abort-controller');

/**
 * Run fetch HTTP request with timeout
 * @param {URL} url - URL to send http request to
 * @param {Object} options - fetch options with support for timeout field. default timeout 10000
 * @returns {Promise<Response>} - Result of fetch request
 * @throws {Error} - Throws error on timeout or other fetch error
 */
async function tFetch(url, options = {}) {
  if (!(url instanceof URL)) {
    throw new TypeError('"url" must be valid URL object');
  }
  let { timeout } = options;

  if (timeout == null) {
    timeout = 10000; // Default
  } else if (!Number.isInteger(timeout)) {
    throw new TypeError('"timeout" must be integer');
  }

  // Initialize abort controller used for aborting request on timeout
  const controller = new AbortController();

  // Attach abort controller to fetch
  // eslint-disable-next-line no-param-reassign
  options.signal = controller.signal;

  // Remove timeout arg from fetch options. We handle timeout ourselves
  // eslint-disable-next-line no-param-reassign
  delete options.timeout;

  let t;

  // If timeout is specified / enabled set timer to abort request
  if (timeout > 0) {
    t = setTimeout(() => {
      controller.abort();
    }, timeout);
  }

  // Execute fetch and store promise
  try {
    // Return fetch result
    return await fetch(url, options);
  } catch (error) {
    // If error is caused by timeout throw custom error
    if (error.name === 'AbortError') {
      throw new Error('Request timeout');
    }
    // else forward error to calling functions
    throw error;
  } finally {
    // Request either errored or succeeded, destroy timer
    if (t) clearTimeout(t);
  }
}

module.exports({ tFetch })
