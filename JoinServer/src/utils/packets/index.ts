import {PacketWithStandardHeader, StandardHeader} from './types';

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
 * The structure for the SDHP_JOIN_SERVER_INFO_SEND packet from GS.
 */

const GSJSServerInfoSend: PacketWithStandardHeader = {
  ...standardHeader,
  serverType: 'byte',
  serverPort: 'wordLE',
  serverName: 'char(50)',
  serverCode: 'wordLE'
};

/**
 * The structure for the SDHP_SERVER_USER_INFO_SEND packet from GS.
 */
const GSJSUserInfoSend: PacketWithStandardHeader = {
  ...standardHeader,
  currentUserCount: 'word',
  maxUserCount: 'word',
};

/**
 * Info: The structure for the SDHP_CONNECT_ACCOUNT_SEND packet from GS.
 * When: Client submits the login form and GS contacts the JS for validation.
 * Action: Receives the data from GS, validates it and respond back to GS with the login results.
 */
const GSJSConnectAccountSend = {
  ...standardHeader,
  index: 'word',
  account: 'char(11)',
  password: 'char(11)',
  ipAddress: 'char(16)',
};

/**
 * The structure for the SDHP_CONNECT_ACCOUNT_RECV packet from JS.
 */
const JSGSConnectAccountSend: PacketWithStandardHeader = {
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

export = {
  GSJSServerInfoSend,
  GSJSUserInfoSend,
  GSJSConnectAccountSend,
  JSGSConnectAccountSend
};
