module.exports = (payload, sendToServer) => {
  const {tcpSockets} = require('./../../tcp');
  const response = {
    event: 'setNumberOfTCPConnections',
    payload: {
      connections: tcpSockets.size
    },
  };
  sendToServer(response);
};
