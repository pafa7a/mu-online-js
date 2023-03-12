const net = require('net');
const byteToNiceHex = require('./byteToNiceHex');

let tcpServer;
const tcpSockets = new Map();

const startServer = port => {
  tcpServer = net.createServer((socket) => {
    // Store the socket in map.
    tcpSockets.set(socket, true);

    if (process.env.DEBUG) {
      console.log(`New client connected. IP: ${socket.remoteAddress}`);
    }

    socket.on("data", (data) => {
      let handler;
      switch (data[0]) {
        case 0xC1:
          switch (data[2]) {
            case 0x00:
              // game server info receive
              handler = gameServerInfoReceive
              break;
            case 0x01:
              // connect account receive
              break;
            case 0x02:
              // disconnect account receive
              break;
            case 0x03:
              // map server move receive
              break;
            case 0x04:
              // map server move auth receive
              break;
            case 0x05:
              // account level receive
              break;
            case 0x06:
              // account level receive 2
              break;
            case 0x30:
              // account already connected receive
              break;
          }
          break;
      }
      onReceive(socket, data, handler);
      if (handler) {
        handler(data, socket);
      }
    });

    socket.on("end", () => {
      // Remove the socket from the map.
      tcpSockets.delete(socket);
      console.log("GameServer disconnected");
    });

    socket.on("error", (error) => {
      // Remove the socket from the map.
      tcpSockets.delete(socket);
      if (error?.code !== 'ECONNRESET') {
        console.log(`Socket Error: ${error.message}`);
      }
    });

  });
  tcpServer.on("error", (error) => {
    console.log(`Server Error: ${error.message}`);
  });

  tcpServer.listen(port, () => {
    console.log(`TCP socket server is running on port: ${port}`);
  });
}

const stopServer = () => {
  tcpServer.close();
}

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
    console.log(`Sent [${description}]:`, byteToNiceHex(data));
  }
}

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
    console.log(`Received [${handlerName}]:`, hexString);
  }
}

/**
 * Handles GameServerInfo request coming from GS.
 * @param {Buffer} data
 * @param {Socket} socket
 */
const gameServerInfoReceive = (data, socket) => {
  const gameServerInfo = {
    serverType: data.readUInt8(3),
    serverPort: data.readUIntLE(4, 2),
    serverName: data.toString('utf8', 6, 56).replace(/\x00.*$/g, ''),
    serverCode: data.readUIntLE(56, 2),
    socket
  }
  console.log(gameServerInfo)
}

module.exports = {
  startServer,
  tcpSockets,
  stopServer
}
