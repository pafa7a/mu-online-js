const { createServer } = require('tls');
const fs = require('fs');
const byteToNiceHex = require('./byteToNiceHex');
const packetManager = require('@mu-online-js/mu-packet-manager');
const structs = require('./packets/index');
const serverInfoResponse = require('./handlers/serverInfoResponse');
const serverListResponse = require('./handlers/serverListResponse');
const logger = require('./logger');

const serverOptions = {
  key: fs.readFileSync('./../ssl/key.pem'),
  cert: fs.readFileSync('./../ssl/cert.pem'),
  rejectUnauthorized: true,
  requestCert: false,
  ca: [fs.readFileSync('./../ssl/cert.pem')],
};

let tcpServer;
const tcpSockets = new Map();

/**
 * @typedef {import('net').Socket} Socket
 */
const startServer = port => {
  tcpServer = createServer(serverOptions, (socket) => {
    // Store the socket in map.
    tcpSockets.set(socket, true);

    if (process.env.DEBUG) {
      logger.info(`New client connected. IP: ${socket.remoteAddress}`);
    }

    // Send the init packet to Main.
    const messageStruct = {
      header: {
        type: 0xC1,
        size: 'auto',
        subCode: 0x00,
      },
      result: 1,
    };
    const initMessageBuffer = new packetManager()
      .useStruct(structs.CSMainSendInitPacket).toBuffer(messageStruct);
    sendData({socket, data: initMessageBuffer, description: 'CSMainSendInitPacket'});

    socket.on('data', (data) => {
      let handler;
      const packetType = data[0];
      let packetHead = data[2];
      let packetSub = data[3];

      if (packetType === 0xC2) {
        packetHead = data[3];
        packetSub = data[4];
      }

      const packetHandlers = {
        0xC1: {
          0xF4: {
            0x03: serverInfoResponse,
            0x06: serverListResponse,
          },
        },
      };

      handler = packetHandlers[packetType]?.[packetHead]?.[packetSub];
      onReceive({data, handler});
      if (handler) {
        handler({data, socket, sendData});
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
const sendData = ({socket, data, description = ''}) => {
  const buffer = Buffer.from(data);
  socket.write(buffer);
  if (process.env.DEBUG) {
    logger.info(`Sent [${description}]: ${byteToNiceHex(data)}`);
  }
};

/**
 * Helper function that logs the bytes in HEX format upon receive.
 * @param socket
 * @param data
 * @param handler
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
