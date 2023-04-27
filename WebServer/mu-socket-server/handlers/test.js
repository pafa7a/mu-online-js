module.exports = (clientName, payload, sendToClient) => {
  const response = {
    event: 'test',
    payload: {
      message: 'request received ;)'
    },
  };
  sendToClient(clientName, response);
};
