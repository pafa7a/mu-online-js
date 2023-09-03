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


const structures = {
  GSJSUserInfo,
};

module.exports = structures;
