module.exports = (payload, sendToServer) => {
  const {tcpSockets} = require('./../../tcp');
  const response = {
    event: 'returnNumberOfTCPConnections',
    payload: {
      connections: tcpSockets.size
    },
  };
  sendToServer(response);
};
