const {createServer} = require('tls');
const byteToNiceHex = require('./byteToNiceHex');
const packetManager = require('@mu-online-js/mu-packet-manager');
const structs = require('./../packets/gameserver');
const globalState = require('./state');
const loginMessage = require('./../enums/loginMessage');
const fs = require('fs');

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
const startTCPServer = port => {
  tcpServer = createServer(serverOptions, (socket) => {
    console.log(`[GameServer] New client connection from IP ${socket.remoteAddress}`);

    NewClientConnected(socket);

    // Store the socket in map.
    tcpSockets.set(socket.remotePort, socket);

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
            case 0x0E:
              handler = MainHackCheckRequest;
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
      tcpSockets.delete(socket.remotePort);
      // Remove the user object.
      globalState.users.delete(socket.remotePort);

      console.log(`[GameServer] Client disconnect for IP ${socket.remoteAddress}`);
    });

    socket.on('error', (error) => {
      // Remove the socket from the map.
      tcpSockets.delete(socket.remotePort);
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
 * @param {Object} rawData
 */
const sendData = (socket, data, description = '', rawData = {}) => {
  const buffer = Buffer.from(data);
  socket.write(buffer);
  if (process.env.DEBUG) {
    console.log(`[GameServer] Sent [${description}]: ${byteToNiceHex(data)}`);
  }
  if (process.env.DEBUG_VERBOSE) {
    console.log(JSON.stringify(rawData, null, 2));
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

  const messageStruct = {
    header: {
      type: 0xC1,
      size: 'auto',
      headCode: 0xF1,
      subCode: 0x01,
    },
    result: loginMessage.LOG_IN_FAIL_WRONG_PASSWORD
  };

  // Validate the provided version and serial.
  if (version !== globalState.version || serial !== globalState.serial) {
    messageStruct.result = loginMessage.LOG_IN_FAIL_WRONG_PASSWORD;
    const message = new packetManager().useStruct(structs.LoginResult).toBuffer(messageStruct);
    sendData(socket, message, 'LoginResult', messageStruct);
    return;
  }

  // Check if already exists in the global state.
  if (globalState?.users.has(socket.remotePort)) {
    const user = globalState.users.get(socket.remotePort);
    user.loginAttempts++;

    // Validate the number of login attempts.
    if (user.loginAttempts > 3) {
      messageStruct.result = loginMessage.LOG_IN_FAIL_EXCEED_MAX_ATTEMPTS;
      const message = new packetManager().useStruct(structs.LoginResult).toBuffer(messageStruct);
      sendData(socket, message, 'LoginResult', messageStruct);
      return;
    }

    messageStruct.result = loginMessage.LOG_IN_FAIL_ALREADY_CONNECTED;
    const message = new packetManager().useStruct(structs.LoginResult).toBuffer(messageStruct);
    sendData(socket, message, 'LoginResult', messageStruct);
    return;
  }
  globalState.users.set(socket.remotePort, {
    socketId: socket.remotePort,
    IP: socket.remoteAddress,
    loginAttempts: 1
  });

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
  sendData(socket, initMessageBuffer, 'NewClientConnected', messageStruct);
};

const MainHackCheckRequest = () => {
  // Potentially can skip this.
};

module.exports = {
  startTCPServer,
  tcpSockets,
  stopTCPServer,
  sendData,
  onReceive
};
