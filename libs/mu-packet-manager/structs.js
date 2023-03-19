/**
 * @typedef {'byte'|'word'} PacketType
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
}

/**
 * The standard packet header structure.
 * @type {{header: {type: string, size: string, headCode: string, subCode: string}}}
 */
const subCodeHeader = {
  header: {
    type: 'byte',
    size: 'byte',
    headCode: 'byte',
    subCode: 'byte',
  }
}

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



const structures = {
  standardHeader,
  CSGameServerInfo,
  CSMainSendInitPacket,
  MainCSSendServerListRequest
};

module.exports = structures;
