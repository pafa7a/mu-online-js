const packetManager = require('@mu-online-js/mu-packet-manager');
const structs = packetManager.getStructs();

/**
 * Handles GameServerConnectAccountReceive request coming from GS.
 * @param {Buffer} data
 * @param {Socket} socket
 * @param {function} sendData
 */
const gameServerConnectAccountReceive = (data, socket, sendData) => {
  const accountInfo = new packetManager().fromBuffer(data)
    .useStruct(structs.GSJSConnectAccountSend).toObject();
  console.log(accountInfo)

  // CProtocolSend::RecvLoginNew from main source ProtocolSend.cpp.
  const loginMessageMapping = {
    LOG_IN_FAIL_PASSWORD: 0,
    LOG_IN_SUCCESS: 1,
    LOG_IN_FAIL_ID: 2,
    LOG_IN_FAIL_ID_CONNECTED: 3,
    LOG_IN_FAIL_SERVER_BUSY: 4,
    LOG_IN_FAIL_ID_BLOCK: 5,
    LOG_IN_FAIL_VERSION: 6,
    LOG_IN_FAIL_CONNECT: 7,
    LOG_IN_FAIL_ERROR: 8,
    LOG_IN_FAIL_NO_PAYMENT_INFO: 9,
    LOG_IN_FAIL_USER_TIME1: 10,
    LOG_IN_FAIL_USER_TIME2: 11,
    LOG_IN_FAIL_PC_TIME1: 12,
    LOG_IN_FAIL_PC_TIME2: 13,
    LOG_IN_FAIL_ONLY_OVER_15: 14,
    LOG_IN_FAIL_CHARGED_CHANNEL: 15,
    LOG_IN_FAIL_POINT_DATE: 16,
    LOG_IN_FAIL_POINT_HOUR: 17,
    LOG_IN_FAIL_INVALID_IP: 18,
  }

  const responseStruct = {
    header: {
      type: 0xC1,
      size: 'auto',
      headCode: 0x01,
    },
    playerIndex: accountInfo.playerIndex,
    account: accountInfo.account,
    personalCode: '1234',
    result: loginMessageMapping.LOG_IN_FAIL_ID,
    blockCode: 0,
    accountLevel: 0,
    accountExpireDate: 'someexpire',
    lock: 0,
  }

  const responseBuffer = new packetManager()
    .useStruct(structs.JSGSConnectAccountSend).toBuffer(responseStruct)
  sendData(socket, responseBuffer, 'send login result')
}

module.exports = gameServerConnectAccountReceive;
