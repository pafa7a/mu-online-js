const packetManager = require('@mu-online-js/mu-packet-manager');
const structs = packetManager.getStructs();
const {addGameServer} = require('../loadGameServersList');

/**
 * Handles CSGameServerInfoHandler request coming from GS.
 * @param {Buffer} data
 * @param {string} address
 * @param {number} port
 */
const CSGameServerInfoHandler = (data, address, port) => {
  const serverInfo = new packetManager().fromBuffer(data)
    .useStruct(structs.CSGameServerInfo)
    .toObject();
  addGameServer(serverInfo, address, port);
};

module.exports = CSGameServerInfoHandler;
