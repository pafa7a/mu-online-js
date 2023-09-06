const globalState = require('./state');
const {getConfig} = require('./config');

/**
 * Stores the version and serial to the global storage.
 */
module.exports = () => {
  const {version, serial} = getConfig('common');
  globalState.version = encodeClientVersion(version);
  globalState.serial = serial;
};

/**
 * Encode the client version.
 * C++ version: {'1'+1, '0'+2, '4'+3, '0'+4, '5'+5};
 *
 * @param {string} version
 * @return {string}
 */
const encodeClientVersion = version => {
  version = version.replaceAll('.', '');
  const encoded = [];
  for (let i = 0; i < version.length; i++) {
    encoded.push(
      String.fromCharCode(version[i].charCodeAt(0) + (i + 1))
    );
  }
  return encoded.join('');
};

