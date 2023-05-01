/**
 * Get the number of TCP connections from a server.
 *
 * @param {String} clientName
 * @param {Object} payload
 * @param {Function} sendToClient
 */
module.exports = (clientName, payload, sendToClient) => {
  const response = {
    event: 'getNumberOfTCPConnections',
  };
  sendToClient(payload.serverName, response);
};
