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
 * Info: The structure for the SDHP_SERVER_USER_INFO_SEND packet from GS.
 * When: Periodically
 * Action: Informs the JoinServer about the current user count and max user count.
 */
const GSJSUserInfo = {
  ...standardHeader,
  currentUserCount: 'word',
  maxUserCount: 'word',
};

/**
 * Info: The structure for the SDHP_CONNECT_ACCOUNT_SEND packet from GS.
 * When: Client submits the login form and GS contacts the JS for validation.
 * Action: Sends the data to JS for validation of the credentials.
 */
const GSJSAccountLogin = {
  ...standardHeader,
  index: 'word',
  account: 'char(11)',
  password: 'char(11)',
  ipAddress: 'char(16)',
};

/**
 * Info: Receive login result from JS.
 * When: Client submits the login form, GS proxy that request to JS and receives the result.
 * Action: Sends the login result to the client.
 */
const JSGSConnectAccountReceive = {
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
  GSJSUserInfo,
  GSJSAccountLogin,
  JSGSConnectAccountReceive
};

module.exports = structures;
