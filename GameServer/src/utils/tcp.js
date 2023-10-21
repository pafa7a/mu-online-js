const {createServer} = require('tls');
const byteToNiceHex = require('./byteToNiceHex');
const packetManager = require('@mu-online-js/mu-packet-manager');
const structs = require('./../packets/gameserver');
const globalState = require('./state');
const loginMessage = require('./../enums/loginMessage');
const {JSAccountLoginSend} = require('./joinserver');
const sendDataToClient = require('./sendDataToClient');
const disconnectPlayer = require('./disconnectPlayer');
const fs = require('fs');

const serverOptions = {
  key: fs.readFileSync('./../ssl/key.pem'),
  cert: fs.readFileSync('./../ssl/cert.pem'),
  rejectUnauthorized: true,
  requestCert: false,
  ca: [fs.readFileSync('./../ssl/cert.pem')],
};
let tcpServer;
const {tcpSockets} = globalState;

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

      const packetHandlers = {
        0xC1: {
          0xF3: {
            0x00: MainCharactersListRequest,
          }
        },
        0xC3: {
          0xF1: {
            0x01: MainLoginRequest,
          },
          0x0E: MainHackCheckRequest,
        },
      };
      handler = packetHandlers[packetType]?.[packetHead]?.[packetSub];
      if (typeof packetHandlers[packetType]?.[packetHead] === 'function') {
        handler = packetHandlers[packetType]?.[packetHead];
      }
      onReceive({buffer, handler});
      if (handler) {
        handler({buffer, socket});
      }
    });

    socket.on('end', () => {
      disconnectPlayer(socket.remotePort);

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
 * Helper function that logs the bytes in HEX format upon receive.
 * @param {Object} buffer
 * @param {Function | String} handler
 * @constructor
 */
const onReceive = ({buffer, handler}) => {
  const hexString = byteToNiceHex(buffer);
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

const MainLoginRequest = ({buffer, socket}) => {
  const userId = socket.remotePort;
  const userIP = socket.remoteAddress;
  const data = new packetManager().fromBuffer(buffer).useStruct(structs.RequestLogin).toObject();
  const {username, password, version, serial} = data;
  let loginAttempts = 1;
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
    sendDataToClient({socket, data: message, description: 'LoginResult', rawData: messageStruct});
    return;
  }

  // Check if already exists in the global state.
  if (globalState?.users.has(userId)) {
    const user = globalState.users.get(userId);
    loginAttempts = user.loginAttempts + 1;
    user.loginAttempts = loginAttempts;

    // Validate the number of login attempts.
    if (user.loginAttempts > 3) {
      messageStruct.result = loginMessage.LOG_IN_FAIL_EXCEED_MAX_ATTEMPTS;
      const message = new packetManager().useStruct(structs.LoginResult).toBuffer(messageStruct);
      sendDataToClient({socket, data: message, description: 'LoginResult', rawData: messageStruct});
      disconnectPlayer(userId);
      return;
    }

    if (user.connected) {
      messageStruct.result = loginMessage.LOG_IN_FAIL_ALREADY_CONNECTED;
      const message = new packetManager().useStruct(structs.LoginResult).toBuffer(messageStruct);
      sendDataToClient({
        socket,
        data: message,
        description: 'LoginResult',
        rawData: messageStruct
      });
      return;
    }
  }
  globalState.users.set(userId, {
    socketId: userId,
    IP: userIP,
    loginAttempts: loginAttempts,
    mapServerMoveRequest: false,
    lastServerCode: -1,
    destMap: -1,
    destX: 0,
    destY: 0,
    connected: false,
  });

  // Send the credentials to JS for validation.
  JSAccountLoginSend({userId, account: username, password, ipAddress: userIP});
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
  sendDataToClient({socket, data: initMessageBuffer, description: 'NewClientConnected', rawData: messageStruct});
};

const MainHackCheckRequest = () => {
  // Potentially can skip this.
};

const MainCharactersListRequest = () => {
  //@TODO: implement the handler.
};

module.exports = {
  startTCPServer,
  tcpSockets,
  stopTCPServer,
  onReceive
};
