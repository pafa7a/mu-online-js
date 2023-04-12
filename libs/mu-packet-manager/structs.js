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
 * The structure for the PMSG_SERVER_INIT_SEND packet in CS.
 * @type {PacketStructure}
 */
const CSMainSendInitPacket = {
  ...standardHeader,
  result: 'byte'
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
 * The struct for packet that Main will send when click on a server.
 * @type {PacketStructure}
 */
const MainCSServerInfoRequest = {
  ...subCodeHeader,
  serverId: 'shortLE'
};

/**
 * The structure for the PMSG_SERVER_INFO_SEND packet in CS.
 * @type {PacketStructure}
 */
const CSMainCSServerInfoResponse = {
  ...subCodeHeader,
  serverAddress: 'char(16)',
  serverPort: 'wordLE',
};

/**
 * The structure for the SDHP_JOIN_SERVER_INFO_SEND packet from GS.
 * @type {{serverCode: string, serverType: string, header: {type: string, size: string, headCode: string}, serverName: string, serverPort: string}}
 */
const GSJSServerInfoSend = {
  ...standardHeader,
  serverType: 'byte',
  serverPort: 'wordLE',
  serverName: 'char(50)',
  serverCode: 'wordLE'
};

/**
 * The structure for the SDHP_SERVER_USER_INFO_SEND packet from GS.
 * @type {{header: {type: string, size: string, headCode: string}, currentUserCount: string, maxUserCount: string}}
 */
const GSJSUserInfoSend = {
  ...standardHeader,
  currentUserCount: 'word',
  maxUserCount: 'word',
};

/**
 * The structure for the SDHP_CONNECT_ACCOUNT_SEND packet from GS.
 * @type {{password: string, ipAddress: string, header: {type: string, size: string, headCode: string}, playerIndex: string, account: string}}
 */
const GSJSConnectAccountSend = {
  ...standardHeader,
  playerIndex: 'word',
  account: 'char(11)',
  password: 'char(11)',
  ipAddress: 'char(16)',
};

/**
 * The structure for the SDHP_CONNECT_ACCOUNT_RECV packet from JS.
 * @type {{personalCode: string, result: string, blockCode: string, accountExpireDate: string, header: {type: string, size: string, headCode: string}, lock: string, accountLevel: string, playerIndex: string, account: string}}
 */
const JSGSConnectAccountSend = {
  ...standardHeader,
  playerIndex: 'word',
  account: 'char(11)',
  personalCode: 'char(14)',
  result: 'byte',
  blockCode: 'byte',
  accountLevel: 'word',
  accountExpireDate: 'char(20)',
  lock: 'dword',
};

const structures = {
  standardHeader,
  CSGameServerInfo,
  CSMainSendInitPacket,
  MainCSSendServerListRequest,
  CSServerListResponse,
  MainCSServerInfoRequest,
  CSMainCSServerInfoResponse,
  GSJSServerInfoSend,
  GSJSUserInfoSend,
  GSJSConnectAccountSend,
  JSGSConnectAccountSend
};

module.exports = structures;
