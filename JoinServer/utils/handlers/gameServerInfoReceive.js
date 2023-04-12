const packetManager = require('@mu-online-js/mu-packet-manager');
const structs = packetManager.getStructs();

/**
 * Handles GameServerInfo request coming from GS.
 * @param {Buffer} data
 * @param {Socket} socket
 */
const gameServerInfoReceive = (data, socket) => {
  const serverInfo = new packetManager().fromBuffer(data)
    .useStruct(structs.GSJSServerInfoSend).toObject();
  const gameServerInfo = {
    serverType: serverInfo.serverType,
    serverPort: serverInfo.serverPort,
    serverName: serverInfo.serverName,
    serverCode: serverInfo.serverCode,
    internalId: socket.remotePort
  };
  console.log(gameServerInfo);
};

module.exports = gameServerInfoReceive;
