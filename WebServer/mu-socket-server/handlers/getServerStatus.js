/**
 * Pass the process info from the server to mu-web-admin.
 *
 * @param {String} clientName
 * @param {Object} payload
 * @param {Function} sendToClient
 * @param {Object} globalStore
 */
module.exports = ({payload, sendToClient, globalStore}) => {
  const serverName = payload.serverName;
  const response = {
    event: 'setServerStatus',
    payload: {
      serverName,
      isOnline: Object.prototype.hasOwnProperty.call(globalStore?.childProcesses, serverName)
    }
  };
  sendToClient('mu-web-admin', response);
};
