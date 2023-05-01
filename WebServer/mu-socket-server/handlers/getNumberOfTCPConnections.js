/**
 Get the number of TCP connections from a server.
 *
 * @param {Object} payload
 * @param {Object} globalStore
 * @param {Function} sendToProcess
 */
module.exports = ({payload, globalStore, sendToProcess}) => {
  const serverName = payload.serverName;
  const process = globalStore?.childProcesses[serverName];
  if (!process) {
    return;
  }
  const data = {
    event: 'getNumberOfTCPConnections',
  };
  sendToProcess(process, data);
};
