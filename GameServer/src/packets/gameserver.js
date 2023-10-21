/**
 * @typedef {'byte'|'word'|'wordLE'|'wordBE'|'dword'|'short'|'shortBE'|'shortLE'|'arrayPadding'|'char(??)'|object} PacketType
 */

/**
 * @typedef {Object.<string, PacketType>} PacketStructure
 */

/**
 * The extended packet header structure with subCode.
 * @type {{header: {type: string, size: string, headCode: string, subCode: string}}}
 */
const subCodeHeader = {
  header: {
    type: 'byte',
    size: 'byte',
    headCode: 'byte',
    subCode: 'byte',
  }
};

/**
 * Info: User login.
 * When: After submitting the login form.
 * Action: Sends the login credentials to GS.
 * C++ struct: PMSG_CONNECT_ACCOUNT_RECV
 */
const RequestLogin = {
  ...subCodeHeader,
  username: 'char(10)',
  password: 'char(20)',
  tickCount: 'dwordBE',
  version: 'char(5)',
  serial: 'char(16)'
};

/**
 * Info: Information about the login result
 * When: after the user login request was sent.
 * Action: Tells the client how to proceed.
 * C++ struct: PMSG_CONNECT_ACCOUNT_SEND
 */
const LoginResult = {
  ...subCodeHeader,
  result: 'byte'
};

/**
 * Info: Request the client to render the login screen scene.
 * When: Immediately when the Client is connected to the GS TCP.
 * Action: Tells the client to display the user login screen.
 * C++ struct: LPPRECEIVE_JOIN_SERVER in Main.
 */
const NewClientConnected = {
  ...subCodeHeader,
  result: 'byte',
  playerIndexH: 'byte',
  playerIndexL: 'byte',
  version: 'char(5)'
};

/**
 * Info: Sends the login result to the client.
 * When: Receive JS login result and just proxy the outcome to the client.
 * Action: Lets the client know what is the login result.
 * C++ struct: PMSG_CONNECT_ACCOUNT_SEND in GS.
 */
const LoginResultToClient = {
  ...subCodeHeader,
  result: 'byte',
};

const structures = {
  RequestLogin,
  LoginResult,
  NewClientConnected,
  LoginResultToClient
};

module.exports = structures;
