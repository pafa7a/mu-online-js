/**
 * @typedef {'byte'|'word'|'wordLE'|'wordBE'|'dword'|'short'|'shortBE'|'shortLE'|'arrayPadding'|'char(??)'|object} PacketType
 */

/**
 * @typedef {Object.<string, PacketType>} PacketStructure
 */

/**
 * The standard packet header structure.
 * @type {{header: {type: string, size: string, headCode: string}}}
 */
const standardHeader = {
  header: {
    type: 'byte',
    size: 'byte',
    headCode: 'byte',
  }
};

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
 * The extended packet header structure with 2 bytes of length.
 * @type {{header: {type: string, size: string, headCode: string, subCode: string}}}
 */
const subCodeHeaderWithShortLength = {
  header: {
    type: 'byte',
    size: 'short',
    headCode: 'byte',
    subCode: 'byte',
  }
};

/**
 * The structure for the PMSG_SERVER_LIST_RECV packet in CS.
 * @type {PacketStructure}
 */
const MainCSSendServerListRequest = {
  ...subCodeHeader,
};

/**
 * The structure for the SDHP_GAME_SERVER_LIVE_SEND packet in GS.
 * @type {PacketStructure}
 */
const CSGameServerInfo = {
  ...standardHeader,
  serverCode: 'word',
  userTotal: 'byte',
  userCount: 'word',
  accountCount: 'word',
  pcPointCount: 'word',
  maxUserCount: 'word'
};

/**
 * The struct for packet that CS will respond to PMSG_SERVER_LIST_RECV.
 * @type {PacketStructure}
 */
const CSServerListResponse = {
  ...subCodeHeaderWithShortLength,
  serverCount: 'shortBE',
  serverLoadInfo: [{
    serverId: 'shortLE',
    loadPercentage: 'byte',
    padding: 'arrayPadding',
  }],
};

/**
 * Info: The struct for packet that Main will send when click on a server.
 * When: After clicking on the server name on idle screen.
 * Action: Requests the IP address and the port of the selected game server.
 * C++ struct: SendRequestServerAddress
 * @type {PacketStructure}
 */
const MainCSServerInfoRequest = {
  ...subCodeHeader,
  serverId: 'shortLE'
};

/**
 * Info: The structure for the PMSG_SERVER_INFO_SEND packet in CS.
 * When: Received from ConnectServer once a specific server info is requested
 * Action: Stores the IP address and the port of the selected game server.
 * Closes the connection with the CS.
 * C++ struct: LPPRECEIVE_SERVER_ADDRESS.
 * @type {PacketStructure}
 */
const CSMainCSServerInfoResponse = {
  ...subCodeHeader,
  serverAddress: 'char(16)',
  serverPort: 'wordLE',
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
 * Info: Request the characters list.
 * When: User login was successful.
 * Action: After successful login, request the characters list.
 * C++ struct: SendRequestCharactersList in Main
 */
const RequestCharactersList = {
  ...subCodeHeader,
  language: 'byte'
};

const structures = {
  CSGameServerInfo,
  MainCSSendServerListRequest,
  CSServerListResponse,
  MainCSServerInfoRequest,
  CSMainCSServerInfoResponse,
  RequestLogin,
  LoginResult,
  RequestCharactersList,
};

module.exports = structures;
