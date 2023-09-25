const {createServer} = require('net');
const byteToNiceHex = require('./byteToNiceHex');
const packetManager = require('@mu-online-js/mu-packet-manager');
const structs = require('./../packets/gameserver');
const globalState = require('./state');
const loginMessage = require('./../enums/loginMessage');

let tcpServer;
const tcpSockets = new Map();

/**
 * @typedef {import('net').Socket} Socket
 */
const startTCPServer = port => {
  tcpServer = createServer((socket) => {
    console.log(`[GameServer] New client connection from IP ${socket.remoteAddress}`);

    NewClientConnected(socket);

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

      switch (packetType) {
        case 0xC3:
          switch (packetHead) {
            case 0xF1:
              switch (packetSub) {
                case 0x01:
                  handler = MainLoginRequest;
                  break;
              }
              break;
          }
          break;
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

const MainLoginRequest = (buffer, socket, sendData) => {
  const data = new packetManager().fromBuffer(buffer).useStruct(structs.RequestLogin).toObject();
  const {username, password, tickCount, version, serial} = data;

  if (version !== globalState.version || serial !== globalState.serial) {
    const messageStruct = {
      header: {
        type: 0xC1,
        size: 'auto',
        headCode: 0xF1,
        subCode: 0x01,
      },
      result: loginMessage.LOG_IN_FAIL_VERSION
    };
    const message = new packetManager().useStruct(structs.LoginResult).toBuffer(messageStruct);
    sendData(socket, message, 'LoginResult');
    return;
  }
  //@TODO: handle the rest.
};

const NewClientConnected = socket => {
  // Send the init packet to Main.
  const messageStruct = {
    header: {
      type: 0xC1,
      size: 'auto',
      headCode: 0xF1,
      subCode: 0x00,
    },
    result: 1,
    playerIndexH: (socket.remotePort >> 8) & 0xFF,
    playerIndexL: socket.remotePort & 0xFF,
    version: globalState.version
  };
  const initMessageBuffer = new packetManager()
    .useStruct(structs.NewClientConnected).toBuffer(messageStruct);
  sendData(socket, initMessageBuffer, 'NewClientConnected');
};


module.exports = {
  startTCPServer,
  tcpSockets,
  stopTCPServer,
  sendData,
  onReceive
};
