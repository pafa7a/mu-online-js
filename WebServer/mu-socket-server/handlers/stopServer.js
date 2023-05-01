/**
 * Pass the process info from the server to mu-web-admin.
 *
 * @param {String} clientName
 * @param {Object} payload
 * @param {Object} globalStore
 */
module.exports = ({payload, globalStore}) => {
  const serverName = payload.serverName;
  const process = globalStore?.childProcesses[serverName];
  if (!process) {
    return;
  }
  process.kill('SIGINT');
};
