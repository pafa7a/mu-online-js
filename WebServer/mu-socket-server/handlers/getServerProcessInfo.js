/**
 * Get process info for specific app.
 *
 * @param {String} clientName
 * @param {Object} payload
 * @param {Function} sendToClient
 */
module.exports = (clientName, payload, sendToClient) => {
  const response = {
    event: 'getProcessInfo',
  };
  sendToClient(payload.serverName, response);
};
