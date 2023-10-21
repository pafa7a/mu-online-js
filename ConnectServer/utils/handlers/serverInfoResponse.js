const packetManager = require('@mu-online-js/mu-packet-manager');
const structs = require('./../packets/index');

/**
 * Handles serverInfoResponse request coming from GS.
 * @param {Buffer} data
 * @param {Socket} socket
 * @param {({socket: Socket, data: Object, description: String}) => void} sendData
 */
const serverInfoResponse = ({data, socket, sendData}) => {
  const {gameServersList} = require('../loadGameServersList');
  const received = new packetManager().fromBuffer(data)
    .useStruct(structs.MainCSServerInfoRequest).toObject();
  const serverId = received?.serverId;
  gameServersList?.forEach(gameServer => {
    if (gameServer.id === serverId && gameServer.state) {
      const messageStruct = {
        header: {
          type: 0xC1,
          size: 'auto',
          headCode: 0xF4,
          subCode: 0x03,
        },
        serverAddress: gameServer['IP'],
        serverPort: gameServer.port,
      };

      const messageBuffer = new packetManager()
        .useStruct(structs.CSMainCSServerInfoResponse).toBuffer(messageStruct);
      sendData({socket, data: messageBuffer, description: 'serverInfoResponse'});
    }
  });
};


module.exports = serverInfoResponse;
