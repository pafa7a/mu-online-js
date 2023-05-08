const { createServer } = require('net');
const byteToNiceHex = require('./byteToNiceHex');
const packetManager = require('@mu-online-js/mu-packet-manager');
const structs = require('./packets/index');
const serverInfoResponse = require('./handlers/serverInfoResponse');
const serverListResponse = require('./handlers/serverListResponse');
const logger = require('./logger');

let tcpServer;
const tcpSockets = new Map();

const HEAD_CODES = {
  C1: 0xC1,
  F4: 0xF4,
  SERVER_INFO_RESPONSE: 0x03,
  SERVER_LIST_RESPONSE: 0x06,
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

    // Send the init packet to Main.
    const messageStruct = {
      header: {
        type: HEAD_CODES.C1,
        size: 'auto',
        subCode: 0x00,
      },
      result: 1,
    };
    const initMessageBuffer = new packetManager()
      .useStruct(structs.CSMainSendInitPacket).toBuffer(messageStruct);
    sendData(socket, initMessageBuffer, 'CSMainSendInitPacket');

    socket.on('data', (data) => {
      let handler;
      switch (data[0]) {
        case HEAD_CODES.C1:
          switch (data[2]) {
            case HEAD_CODES.F4:
              switch (data[3]) {
                case HEAD_CODES.SERVER_INFO_RESPONSE:
                  handler = serverInfoResponse;
                  break;
                case HEAD_CODES.SERVER_LIST_RESPONSE:
                  handler = serverListResponse;
                  break;
              }
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
      logger.info('Client disconnected');
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

const stopServer = () => {
  tcpServer.close();
};

module.exports = {
  startServer,
  tcpSockets,
  serverListResponse,
  stopServer,
  sendData,
  onReceive
};
