const { createServer } = require('net');
const byteToNiceHex = require('./byteToNiceHex');
const {gameServersList} = require('./loadGameServersList');
const packetManager = require('@mu-online-js/mu-packet-manager');
const structs = packetManager.getStructs();

let tcpServer;
const tcpSockets = new Map();

/**
 * @typedef {import('net').Socket} Socket
 */
const startServer = port => {
  tcpServer = createServer((socket) => {
    // Store the socket in map.
    tcpSockets.set(socket, true);

    if (process.env.DEBUG) {
      console.log(`New client connected. IP: ${socket.remoteAddress}`);
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
    sendData(socket, initMessageBuffer, 'CSMainSendInitPacket');

    socket.on('data', (data) => {
      let handler;
      switch (data[0]) {
      case 0xC1:
        switch (data[2]) {
        case 0xF4:
          switch (data[3]) {
          case 0x03:
            handler = serverInfoResponse;
            break;
          case 0x06:
            handler = serverListResponse;
            break;
          }
          break;
        }
        break;
      }
      onReceive(socket, data, handler);
      if (handler) {
        handler(data, socket);
      }
    });

    socket.on('end', () => {
      // Remove the socket from the map.
      tcpSockets.delete(socket);
      console.log('Client disconnected');
    });

    socket.on('error', (error) => {
      // Remove the socket from the map.
      tcpSockets.delete(socket);
      if (error?.code !== 'ECONNRESET') {
        console.log(`Socket Error: ${error.message}`);
      }
    });

  });
  tcpServer.on('error', (error) => {
    console.log(`Server Error: ${error.message}`);
  });

  tcpServer.listen(port, () => {
    console.log(`TCP socket server is running on port: ${port}`);
  });
};

const serverListResponse = (data, socket) => {
  // Send the "server list" message to the server
  const list = getActiveServerList();
  const messageStruct = {
    header: {
      type: 0xC2,
      size: 'auto',
      headCode: 0xF4,
      subCode: 0x06,
    },
    serverCount: list.length,
    serverLoadInfo: list
  };
  const message = new packetManager()
    .useStruct(structs.CSServerListResponse).toBuffer(messageStruct);
  sendData(socket, message, 'serverListResponse');
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
    console.log(`Sent [${description}]:`, byteToNiceHex(data));
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
    console.log(`Received [${handlerName}]:`, hexString);
  }
};

/**
 * Handles serverInfoResponse request coming from GS.
 * @param {Buffer} data
 * @param {Socket} socket
 */
const serverInfoResponse = (data, socket) => {
  const received = new packetManager().fromBuffer(data)
    .useStruct(structs.MainCSServerInfoRequest).toObject();
  const serverId = received?.serverId;
  gameServersList.forEach(gameServer => {
    if (gameServer.id === serverId && gameServer.state) {
      const messageStruct = {
        header: {
          type: 0xC1,
          size: 'auto',
          headCode: 0xF4,
          subCode: 0x03,
        },
        serverAddress: gameServer['IP'],
        serverPort: gameServer.port,
      };

      const messageBuffer = new packetManager()
        .useStruct(structs.CSMainCSServerInfoResponse).toBuffer(messageStruct);
      sendData(socket, messageBuffer, 'serverInfoResponse');
    }
  });
};

const getActiveServerList = () => {
  const list = [];
  gameServersList.forEach(gameServer => {
    if (gameServer.show && gameServer.state) {
      list.push({
        serverId: gameServer.id,
        loadPercentage: gameServer.userTotal
      });
    }
  });
  return list;
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
