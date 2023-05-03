const { createServer } = require('net');
const byteToNiceHex = require('./byteToNiceHex');
const gameServerConnectAccountReceive = require('./handlers/gameServerConnectAccountReceive');
const gameServerInfoReceive = require('./handlers/gameServerInfoReceive');
const gameServerUserInfoReceive = require('./handlers/gameServerUserInfoReceive');
const logger = require('./logger');

let tcpServer;
const tcpSockets = new Map();

const HEAD_CODES = {
  C1: 0xC1,
  GAME_SERVER_INFO_RECEIVE: 0x00,
  GAME_SERVER_CONNECT_ACCOUNT_RECEIVE: 0x01,
  DISCONNECT_ACCOUNT_RECEIVE: 0x02,
  MAP_SERVER_MOVE_RECEIVE: 0x03,
  MAP_SERVER_MOVE_AUTH_RECEIVE: 0x04,
  ACCOUNT_LEVEL_RECEIVE: 0x05,
  ACCOUNT_LEVEL_RECEIVE_2: 0x06,
  GJ_MAP_SERVER_MOVE_CANCEL_RECEIVE: 0x10,
  GJ_ACCOUNT_LEVEL_SAVE_RECEIVE: 0x11,
  GJ_ACCOUNT_LOCK_SAVE_RECEIVE: 0x12,
  GAME_SERVER_USER_INFO_RECEIVE: 0x20,
  ACCOUNT_ALREADY_CONNECTED_RECEIVE: 0x30,
};

/**
 * @typedef {import('net').Socket} Socket
 */
const startServer = port => {
  tcpServer = createServer((socket) => {
    // Store the socket in map.
    tcpSockets.set(socket, true);

    if (process.env.DEBUG) {
      logger.info(`New client connected. IP: ${socket.remoteAddress}`);
    }

    socket.on('data', (data) => {
      let handler;
      switch (data[0]) {
      case HEAD_CODES.C1:
        switch (data[2]) {
        case HEAD_CODES.GAME_SERVER_INFO_RECEIVE:
          handler = gameServerInfoReceive;
          break;
        case HEAD_CODES.GAME_SERVER_CONNECT_ACCOUNT_RECEIVE:
          handler = gameServerConnectAccountReceive;
          break;
        case HEAD_CODES.DISCONNECT_ACCOUNT_RECEIVE:
          // disconnect account receive
          break;
        case HEAD_CODES.MAP_SERVER_MOVE_RECEIVE:
          // map server move receive
          break;
        case HEAD_CODES.MAP_SERVER_MOVE_AUTH_RECEIVE:
          // map server move auth receive
          break;
        case HEAD_CODES.ACCOUNT_LEVEL_RECEIVE:
          // account level receive
          break;
        case HEAD_CODES.ACCOUNT_LEVEL_RECEIVE_2:
          // account level receive 2
          break;
        case HEAD_CODES.GJ_MAP_SERVER_MOVE_CANCEL_RECEIVE:
          // GJMapServerMoveCancelReceive
          break;
        case HEAD_CODES.GJ_ACCOUNT_LEVEL_SAVE_RECEIVE:
          // GJAccountLevelSaveReceive
          break;
        case HEAD_CODES.GJ_ACCOUNT_LOCK_SAVE_RECEIVE:
          // GJAccountLockSaveReceive
          break;
        case HEAD_CODES.GAME_SERVER_USER_INFO_RECEIVE:
          handler = gameServerUserInfoReceive;
          break;
        case HEAD_CODES.ACCOUNT_ALREADY_CONNECTED_RECEIVE:
          // account already connected receive
          break;
        }
        break;
      }
      onReceive(socket, data, handler);
      if (handler) {
        handler(data, socket, sendData);
      }
    });

    socket.on('end', () => {
      // Remove the socket from the map.
      tcpSockets.delete(socket);
      logger.info('GameServer disconnected');
    });

    socket.on('error', (error) => {
      // Remove the socket from the map.
      tcpSockets.delete(socket);
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
 */
const sendData = (socket, data, description = '') => {
  const buffer = Buffer.from(data);
  socket.write(buffer);
  if (process.env.DEBUG) {
    logger.info(`Sent [${description}]: ${byteToNiceHex(data)}`);
  }
};

/**
 * Helper function that logs the bytes in HEX format upon receive.
 * @param {Socket} socket
 * @param {Object} data
 * @param {Function | String} handler
 */
const onReceive = (socket, data, handler) => {
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
