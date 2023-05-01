/**
 * Answer if specific server is online or not.
 *
 * @param {String} clientName
 * @param {Object} payload
 * @param {Function} sendToClient
 * @param {Map} connectedClients
 */
module.exports = (clientName, payload, sendToClient, connectedClients) => {
  const response = {
    event: 'isServerOnline',
    payload: {
      serverName: payload.serverName,
      isOnline: connectedClients.has(payload.serverName)
    },
  };
  sendToClient(clientName, response);
};
