const { createServer } = require('net');
const byteToNiceHex = require('./byteToNiceHex');
const packetManager = require('@mu-online-js/mu-packet-manager');

let tcpServer;
const tcpSockets = new Map();

/**
 * @typedef {import('net').Socket} Socket
 */
const startTCPServer = port => {
  tcpServer = createServer((socket) => {
    console.log(`[GameServer] New client connection from IP ${socket.remoteAddress}`);
    // Store the socket in map.
    tcpSockets.set(socket, true);

    socket.on('data', buffer => {
      let handler;
      const packetType = buffer[0];
      let packetHead = buffer[2];
      let packetSub = buffer[3];

      if (packetType === 0xC2) {
        packetHead = buffer[3];
        packetSub = buffer[4];
      }
      onReceive(socket, buffer, handler);
      if (handler) {
        handler(buffer, socket, sendData);
      }
    });

    socket.on('end', () => {
      // Remove the socket from the map.
      tcpSockets.delete(socket);

      console.log(`[GameServer] Client disconnect for IP ${socket.remoteAddress}`);
    });

    socket.on('error', (error) => {
      // Remove the socket from the map.
      tcpSockets.delete(socket);
      if (error?.code !== 'ECONNRESET') {
        console.log(`[GameServer] Socket Error: ${error.message}`);
      }
    });

  });
  tcpServer.on('error', (error) => {
    console.log(`[GameServer] Server Error: ${error.message}`);
  });

  tcpServer.listen(port, () => {
    console.log(`[GameServer] TCP socket server is running on port: ${port}`);
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
    console.log(`[GameServer] Sent [${description}]: ${byteToNiceHex(data)}`);
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
    console.log(`[GameServer] Received [${handlerName}]: ${hexString}`);
  }
};

const stopTCPServer = () => {
  tcpServer.close();
};

module.exports = {
  startTCPServer,
  tcpSockets,
  stopTCPServer,
  sendData,
  onReceive
};
