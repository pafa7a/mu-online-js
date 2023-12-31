import {PacketWithSubcodeHeader, PacketWithStandardHeader, StandardHeader, SubcodeHeader} from './types';
/**
 * The standard packet header structure.
 */
const standardHeader: StandardHeader = {
  header: {
    type: 'byte',
    size: 'byte',
    headCode: 'byte',
  }
};

/**
 * The extended packet header structure with subCode.
 */
const subCodeHeader: SubcodeHeader = {
  header: {
    type: 'byte',
    size: 'byte',
    headCode: 'byte',
    subCode: 'byte',
  }
};

/**
 * The extended packet header structure with 2 bytes of length.
 */
const subCodeHeaderWithShortLength: SubcodeHeader = {
  header: {
    type: 'byte',
    size: 'short',
    headCode: 'byte',
    subCode: 'byte',
  }
};

/**
 * The structure for the PMSG_SERVER_INIT_SEND packet in CS.
 */
const CSMainSendInitPacket: PacketWithStandardHeader = {
  ...standardHeader,
  result: 'byte'
};

/**
 * The structure for the PMSG_SERVER_LIST_RECV packet in CS.
 */
const MainCSSendServerListRequest: PacketWithSubcodeHeader = {
  ...subCodeHeader,
};

/**
 * The structure for the SDHP_GAME_SERVER_LIVE_SEND packet in GS.
 */
const CSGameServerInfo: PacketWithStandardHeader = {
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
 */
const CSServerListResponse: PacketWithSubcodeHeader = {
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
 */
const MainCSServerInfoRequest: PacketWithSubcodeHeader = {
  ...subCodeHeader,
  serverId: 'shortLE'
};

/**
 * The structure for the PMSG_SERVER_INFO_SEND packet in CS.
 */
const CSMainCSServerInfoResponse: PacketWithSubcodeHeader = {
  ...subCodeHeader,
  serverAddress: 'char(16)',
  serverPort: 'wordLE',
};

export = {
  CSGameServerInfo,
  CSMainSendInitPacket,
  MainCSSendServerListRequest,
  CSServerListResponse,
  MainCSServerInfoRequest,
  CSMainCSServerInfoResponse,
};
