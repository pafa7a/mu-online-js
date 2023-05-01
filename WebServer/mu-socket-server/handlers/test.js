module.exports = ({clientName, sendToClient}) => {
  const response = {
    event: 'test',
    payload: {
      message: 'request received ;)'
    },
  };
  sendToClient(clientName, response);
};
