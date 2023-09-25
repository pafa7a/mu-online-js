const {getConfig} = require('./config');
const udp = require('dgram');
const structs = require('./../packets/connectserver');
const packetManager = require('@mu-online-js/mu-packet-manager');
const globalState = require('./state');
const byteToNiceHex = require('./byteToNiceHex');

const client = udp.createSocket('udp4');

const CSInfoSend = () => {
  const {code, maxUsers} = getConfig('common');
  const messageStruct = {
    header: {
      type: 0xC1,
      size: 'auto',
      headCode: 0x01,
    },
    serverCode: code,
    userTotal: globalState.users.length ? (globalState.users.length * 100) / maxUsers : 0,
    userCount: globalState.users.length,
    accountCount: 0,
    pcPointCount: 0,
    maxUserCount: maxUsers
  };

  const message = new packetManager()
    .useStruct(structs.GSCSInfo).toBuffer(messageStruct);
  sendData(message, 'CSInfoSend');
};

/**
 * Helper function that logs the bytes in HEX format upon sending data.
 * @param {Object} data
 * @param {String} description
 */
const sendData = (data, description = '') => {
  const {connectServerAddress, connectServerPort} = getConfig('common');
  client.send(data, connectServerPort, connectServerAddress, err => {
    if (err) {
      console.log(`[JoinServer] Server is unreachable on ${connectServerAddress}:${connectServerPort}.`);
    }
  });
  if (process.env.DEBUG) {
    //console.log(`[ConnectServer] Sending [${description}]: ${byteToNiceHex(data)}`);
  }
};

module.exports = {
  CSInfoSend,
  sendData
};
