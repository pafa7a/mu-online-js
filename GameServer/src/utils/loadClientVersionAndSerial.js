const globalState = require('./state');
const {getConfig} = require('./config');

/**
 * Stores the version and serial to the global storage.
 */
module.exports = () => {
  const {version, serial} = getConfig('common');
  globalState.version = version;
  globalState.serial = serial;
};
