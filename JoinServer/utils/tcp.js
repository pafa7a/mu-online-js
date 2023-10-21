const {createServer} = require('net');
const byteToNiceHex = require('./byteToNiceHex');
const gameServerConnectAccountReceive = require('./handlers/gameServerConnectAccountReceive');
const gameServerInfoReceive = require('./handlers/gameServerInfoReceive');
const gameServerUserInfoReceive = require('./handlers/gameServerUserInfoReceive');
const logger = require('./logger');

let tcpServer;
const tcpSockets = new Map();

/**
 * @typedef {import('net').Socket} Socket
 */
const startServer = port => {
  tcpServer = createServer((socket) => {
    // Store the socket in map.
    tcpSockets.set(socket.remotePort, socket);

    if (process.env.DEBUG) {
      logger.info(`New client connected. IP: ${socket.remoteAddress}`);
    }

    socket.on('data', (data) => {
      let handler;
      const packetType = data[0];
      let packetHead = data[2];

      const packetHandlers = {
        0xC1: {
          0x00: gameServerInfoReceive,
          0x01: gameServerConnectAccountReceive,
          0x02: {
            // disconnect account receive
          },
          0x03: {
            // map server move receive
          },
          0x04: {
            // map server move auth receive
          },
          0x05: {
            // account level receive
          },
          0x06: {
            // account level receive 2
          },
          0x10: {
            // GJMapServerMoveCancelReceive
          },
          0x11: {
            // GJAccountLevelSaveReceive
          },
          0x12: {
            // GJAccountLockSaveReceive
          },
          0x20: gameServerUserInfoReceive,
          0x30: {
            // account already connected receive
          },
        },
      };

      handler = packetHandlers[packetType]?.[packetHead];
      onReceive({data, handler});
      if (handler) {
        handler({data, socket, sendData});
      }
    });

    socket.on('end', () => {
      // Remove the socket from the map.
      tcpSockets.delete(socket.remotePort);
      logger.info('GameServer disconnected');
    });

    socket.on('error', (error) => {
      // Remove the socket from the map.
      tcpSockets.delete(socket.remotePort);
      if (error?.code !== 'ECONNRESET') {
        logger.info(`Socket Error: ${error.message}`);
      }
    });

  });
  tcpServer.on('error', (error) => {
    logger.info(`Server Error: ${error.message}`);
  });

  tcpServer.listen(port, () => {
    logger.info(`TCP socket server is running on port: ${port}`);
  });
};

const stopServer = () => {
  tcpServer.close();
};

/**
 * Helper function that logs the bytes in HEX format upon sending data.
 * @param {Socket} socket
 * @param {Object} data
 * @param {String} description
 * @param {Object} rawData
 */
const sendData = ({socket, data, description = '', rawData = {}}) => {
  const buffer = Buffer.from(data);
  socket.write(buffer);
  if (process.env.DEBUG) {
    logger.info(`Sent [${description}]: ${byteToNiceHex(data)}`);
  }
  if (process.env.DEBUG_VERBOSE) {
    logger.info(JSON.stringify(rawData, null, 2));
  }
};

/**
 * Helper function that logs the bytes in HEX format upon receive.
 * @param {Object} data
 * @param {Function | String} handler
 */
const onReceive = ({data, handler}) => {
  const hexString = byteToNiceHex(data);
  let handlerName = 'Unknown';
  if (typeof handler === 'function') {
    handlerName = handler.name;
  }

  if (process.env.DEBUG) {
    logger.info(`Received [${handlerName}]: ${hexString}`);
  }
};

module.exports = {
  startServer,
  tcpSockets,
  stopServer
};
