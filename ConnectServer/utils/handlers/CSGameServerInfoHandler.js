const packetManager = require('@mu-online-js/mu-packet-manager');
const structs = require('./../packets/index');
const {addGameServer} = require('../loadGameServersList');

/**
 * Handles CSGameServerInfoHandler request coming from GS.
 * @param {Buffer} data
 * @param {Object} remoteInfo
 */
const CSGameServerInfoHandler = ({data, remoteInfo: {address, port}}) => {
  const serverInfo = new packetManager().fromBuffer(data)
    .useStruct(structs.CSGameServerInfo)
    .toObject();
  addGameServer(serverInfo, address, port);
};

module.exports = CSGameServerInfoHandler;
