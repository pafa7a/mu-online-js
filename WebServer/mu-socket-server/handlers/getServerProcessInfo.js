/**
 * Get process info for specific app.
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
    event: 'getProcessInfo',
  };
  sendToProcess(process, data);
};
