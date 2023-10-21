const byteToNiceHex = require('./byteToNiceHex');
/**
 * Helper function that logs the bytes in HEX format upon sending data.
 * @param {Socket} socket
 * @param {Object} data
 * @param {String} description
 * @param {Object} rawData
 * @constructor
 */
module.exports = ({socket, data, description = '', rawData = {}}) => {
  const buffer = Buffer.from(data);
  socket.write(buffer);
  if (process.env.DEBUG) {
    console.log(`[GameServer] Sent [${description}]: ${byteToNiceHex(data)}`);
  }
  if (process.env.DEBUG_VERBOSE) {
    console.log(JSON.stringify(rawData, null, 2));
  }
};
