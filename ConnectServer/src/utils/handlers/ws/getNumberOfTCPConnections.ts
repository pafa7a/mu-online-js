import {tcpSockets} from '../../tcp';

export = (_: never, sendToServer: (response: object) => void) => {
  const response = {
    event: 'setNumberOfTCPConnections',
    payload: {
      connections: tcpSockets.size,
    },
  };

  sendToServer(response);
};
