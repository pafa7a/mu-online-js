const {getConfig} = require('./config');
const {connect} = require('net');
const structs = require('./../packets/joinserver');
const packetManager = require('@mu-online-js/mu-packet-manager');
const globalState = require('./state');
const byteToNiceHex = require('./byteToNiceHex');

let client;

const connectToJS = () => {
  const {joinServerAddress, joinServerPort} = getConfig('common');
  client = connect({host: joinServerAddress, port: joinServerPort}, () => {
    console.log(`[JoinServer] Connected successfully on ${joinServerAddress}:${joinServerPort}`);
  });

  client.on('data', (data) => {
    console.log(`Received data from server: ${data}`);
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
  sendData(message, 'JSUserInfoSend');
};

/**
 * Helper function that logs the bytes in HEX format upon sending data.
 * @param {Object} data
 * @param {String} description
 */
const sendData = (data, description = '') => {
  client.write(data);
  if (process.env.DEBUG) {
    console.log(`[JoinServer] Sending [${description}]: ${byteToNiceHex(data)}`);
  }
};

module.exports = {
  connectToJS,
  JSUserInfoSend,
  sendData
};
