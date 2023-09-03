const {createSocket} = require('dgram');
const byteToNiceHex = require('./byteToNiceHex');
const {gameServersList, removeGameServer} = require('./loadGameServersList');
const CSGameServerInfoHandler = require('./handlers/CSGameServerInfoHandler');
const logger = require('./logger');

const CLIENT_TIMEOUT = 10000;

let intervalId;
let udpServer;

const HEAD_CODES = {
  C1: 0xC1,
  GS_GAME_SERVER_INFO_HANDLER: 0x01,
};

const startServer = port => {
  udpServer = createSocket('udp4');
  udpServer.on('message', (data, remoteInfo) => {
    let handler;
    switch (data[0]) {
      case HEAD_CODES.C1:
        switch (data[2]) {
          case HEAD_CODES.GS_GAME_SERVER_INFO_HANDLER:
            handler = CSGameServerInfoHandler;
            break;
        }
        break;
    }
    onReceive(data, handler);
    if (handler) {
      handler(data, remoteInfo.address, remoteInfo.port);
    }
  });

  udpServer.bind(port, () => {
    logger.info('UDP server listening on port 55557');
  });
};

const onReceive = (data, handler) => {
  const hexString = byteToNiceHex(data);
  let handlerName = 'Unknown';
  if (typeof handler === 'function') {
    handlerName = handler.name;
  }

  if (process.env.DEBUG_UDP && handlerName === 'Unknown') {
    logger.info(`Received [${handlerName}]: ${hexString}`);
  }
};

const stopServer = () => {
  clearInterval(intervalId);
  udpServer.close();
};

/**
 * Check periodically if the GameServer is still running.
 */
intervalId = setInterval(() => {
  const now = Date.now();
  gameServersList.forEach(server => {
    // If the server was ever connected.
    if (server.internalPort && server.address && server.lastMessageTime) {
      // Check if the last message was received for more than the timeout limit.
      if (now - server.lastMessageTime > CLIENT_TIMEOUT) {
        removeGameServer(server);
      }
    }
  });
}, 5000);

module.exports = {
  startServer,
  stopServer
};
