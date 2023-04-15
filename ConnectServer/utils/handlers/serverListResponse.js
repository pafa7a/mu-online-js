const packetManager = require('@mu-online-js/mu-packet-manager');
const {gameServersList} = require('../loadGameServersList');
const structs = packetManager.getStructs();

const getActiveServerList = () => {
  const list = [];
  gameServersList.forEach(gameServer => {
    if (gameServer.show && gameServer.state) {
      list.push({
        serverId: gameServer.id,
        loadPercentage: gameServer.userTotal
      });
    }
  });
  return list;
};

/**
 * Handles serverListResponse request.
 * @param {Buffer} data
 * @param {Socket} socket
 * @param {function} sendData
 */
const serverListResponse = (data, socket, sendData) => {
  // Send the "server list" message to the server
  const list = getActiveServerList();
  const messageStruct = {
    header: {
      type: 0xC2,
      size: 'auto',
      headCode: 0xF4,
      subCode: 0x06,
    },
    serverCount: list.length,
    serverLoadInfo: list
  };
  const message = new packetManager()
    .useStruct(structs.CSServerListResponse).toBuffer(messageStruct);
  sendData(socket, message, 'serverListResponse');
};

module.exports = serverListResponse;
