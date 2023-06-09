/**
 * Pass the process info from the server to mu-web-admin.
 *
 * @param {String} clientName
 * @param {Object} payload
 * @param {Function} sendToClient
 */
module.exports = ({clientName, payload, sendToClient}) => {
  const response = {
    event: 'setNumberOfTCPConnections',
    payload: {
      serverName: clientName,
      ...payload
    }
  };
  sendToClient('mu-web-admin', response);
};
