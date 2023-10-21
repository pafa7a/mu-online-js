const {getConfig} = require('./config');
const {connect} = require('net');
const structs = require('./../packets/joinserver');
const GSstructs = require('./../packets/gameserver');
const packetManager = require('@mu-online-js/mu-packet-manager');
const globalState = require('./state');
const byteToNiceHex = require('./byteToNiceHex');
const sendDataToClient = require('./sendDataToClient');
const disconnectPlayer = require('./disconnectPlayer');

let client;
const {tcpSockets} = globalState;

const connectToJS = () => {
  const {joinServerAddress, joinServerPort} = getConfig('common');
  client = connect({host: joinServerAddress, port: joinServerPort}, () => {
    console.log(`[JoinServer] Connected successfully on ${joinServerAddress}:${joinServerPort}`);
  });

  client.on('data', buffer => {
    let handler;
    const packetType = buffer[0];
    let packetHead = buffer[2];
    const packetHandlers = {
      0xC1: {
        0x01: LoginAccountReceive,
      },
    };
    handler = packetHandlers[packetType]?.[packetHead];
    onReceive({buffer, handler});
    if (handler) {
      handler({buffer, client});
    }
  });

  // Handle connection closure
  client.on('close', () => {
    console.log(`[JoinServer] Server is unreachable on ${joinServerAddress}:${joinServerPort}. Retrying after 5 seconds.`);
    setTimeout(() => {
      connectToJS();
    }, 5000);
  });

  client.on('error', error => {
    console.log(`[JoinServer] ${error}`);
  });
};

/**
 * Helper function that logs the bytes in HEX format upon receive.
 * @param {Object} options - The options for data handling.
 * @param {Buffer} options.buffer - Request buffer.
 * @param {Function | String} options.handler - The handler function name.
 */
const onReceive = ({buffer, handler}) => {
  const hexString = byteToNiceHex(buffer);
  let handlerName = 'Unknown';
  if (typeof handler === 'function') {
    handlerName = handler.name;
  }

  if (process.env.DEBUG) {
    console.log(`[JS->GameServer] Received [${handlerName}]: ${hexString}`);
  }
};

/**
 * Helper function that logs the bytes in HEX format upon sending data.
 * @param data
 * @param description
 */
const sendData = ({data, description = ''}) => {
  client.write(data);
  if (process.env.DEBUG_JS) {
    console.log(`[JoinServer] Sending [${description}]: ${byteToNiceHex(data)}`);
  }
};

const JSUserInfoSend = () => {
  const {maxUsers} = getConfig('common');
  const messageStruct = {
    header: {
      type: 0xC1,
      size: 'auto',
      headCode: 0x20,
    },
    currentUserCount: globalState.users.length,
    maxUserCount: maxUsers,
  };

  const message = new packetManager()
    .useStruct(structs.GSJSUserInfo).toBuffer(messageStruct);
  sendData({data: message, description: 'JSUserInfoSend'});
};

/**
 * Send the login request to JS.
 * @param userId
 * @param account
 * @param password
 * @param ipAddress
 * @constructor
 */
const JSAccountLoginSend = ({userId, account, password, ipAddress}) => {
  const messageStruct = {
    header: {
      type: 0xC1,
      size: 'auto',
      headCode: 0x01,
    },
    index: userId,
    account,
    password,
    ipAddress,
  };

  const message = new packetManager()
    .useStruct(structs.GSJSAccountLogin).toBuffer(messageStruct);
  sendData({data: message, description: 'GSJSAccountLogin'});
};

/**
 * Receive login result from JS and pass it to the Client.
 * @param buffer
 * @constructor
 */
const LoginAccountReceive = ({buffer}) => {
  const data = new packetManager().fromBuffer(buffer).useStruct(structs.JSGSConnectAccountReceive).toObject();
  /**
   * @type {Socket}
   */
  const playerSocket = tcpSockets.get(data.playerIndex);
  const userObject = globalState.users.get(data.playerIndex);
  if (!playerSocket || !userObject) {
    disconnectPlayer();
    return;
  }
  const messageStruct = {
    header: {
      type: 0xC1,
      size: 'auto',
      headCode: 0xF1,
      subCode: 0x01,
    },
    result: data.result,
  };
  const message = new packetManager()
    .useStruct(GSstructs.LoginResultToClient).toBuffer(messageStruct);

  if (data.result === 1) {
    userObject.connected = true;
  }
  sendDataToClient({socket: playerSocket, data: message, description: 'LoginResultToClient', rawData: messageStruct});
};

module.exports = {
  connectToJS,
  JSUserInfoSend,
  sendData,
  JSAccountLoginSend
};
