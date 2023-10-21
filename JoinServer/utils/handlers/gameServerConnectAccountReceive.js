const packetManager = require('@mu-online-js/mu-packet-manager');
const structs = require('./../packets/index');
const loginMessage = require('../enums/loginMessage');
const db = require('@mu-online-js/mu-db');
const logger = require('./../logger');

/**
 * Handles GameServerConnectAccountReceive request coming from GS.
 * @param {Buffer} data
 * @param {Socket} socket
 * @param {({socket: Socket, data: Object, description: String, rawData: Object}) => void} sendData
 */
const gameServerConnectAccountReceive = async ({data, socket, sendData}) => {
  const accountInfo = new packetManager().fromBuffer(data)
    .useStruct(structs.GSJSConnectAccountSend).toObject();
  logger.info(accountInfo);

  /**
   * Results of a database query to retrieve account information.
   * @typedef {Object} DbMembInfoResponseItem
   * @property {number} memb_guid - The unique ID of the account.
   * @property {string} memb___id - The account username.
   * @property {string} memb__pwd - The account password.
   * @property {string} sno__numb - The account personal code.
   * @property {number} bloc_code - The account block code.
   *
   * @typedef {DbMembInfoResponseItem[]} DbMembInfoResponse
   */

  /**
   * The result of the database query to retrieve account information.
   * @type {DbMembInfoResponse}
   */
  const dbResult = await db('SELECT memb__pwd, sno__numb FROM memb_info WHERE memb___id = ?', [
    accountInfo.account
  ]);

  const responseStruct = {
    header: {
      type: 0xC1,
      size: 'auto',
      headCode: 0x01,
    },
    playerIndex: accountInfo.index,
    account: accountInfo.account,
    personalCode: '',
    result: loginMessage.LOG_IN_FAIL_ID,
    blockCode: 0,
    accountLevel: 0,
    accountExpireDate: '',
    lock: 0,
  };

  if (dbResult.length) {
    const [dbAccount] = dbResult;
    //@TODO: create db table with IP blacklist and check if the IP is there.
    // Validate password.
    if (dbAccount.memb__pwd !== accountInfo.password) {
      responseStruct.result = loginMessage.LOG_IN_FAIL_PASSWORD;
    }
    // Validate blocked.
    else if (dbAccount.bloc_code === 1) {
      responseStruct.result = loginMessage.LOG_IN_FAIL_ID_BLOCK;
    }
    // Successful login.
    else {
      responseStruct.result = loginMessage.LOG_IN_SUCCESS;
      responseStruct.personalCode = dbAccount.sno__numb;
    }
  }

  const responseBuffer = new packetManager()
    .useStruct(structs.JSGSConnectAccountSend).toBuffer(responseStruct);
  sendData({socket, data: responseBuffer, description: 'send login result', rawData: responseStruct});
};

module.exports = gameServerConnectAccountReceive;
