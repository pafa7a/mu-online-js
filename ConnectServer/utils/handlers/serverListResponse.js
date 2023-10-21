const packetManager = require('@mu-online-js/mu-packet-manager');
const structs = require('./../packets/index');

const getActiveServerList = () => {
  const {gameServersList} = require('../loadGameServersList');
  const list = [];
  gameServersList?.forEach(gameServer => {
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
 * Handles serverListResponse request.=
 * @param {Socket} socket
 * @param {({socket: Socket, data: Object, description: String}) => void} sendData
 */
const serverListResponse = ({socket, sendData}) => {
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
  sendData({socket, data: message, description: 'serverListResponse'});
};

module.exports = serverListResponse;
