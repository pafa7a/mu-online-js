const globalState = require('./state');
/**
 * Helper function to disconnect user by socket id.
 * @param socketId
 */
module.exports = socketId => {
  const socket = globalState.tcpSockets.get(socketId);
  if (socket) {
    socket.end();
  }
  // Remove the socket from the map.
  globalState.tcpSockets.delete(socketId);
  // Remove the user object.
  globalState.users.delete(socketId);
};
