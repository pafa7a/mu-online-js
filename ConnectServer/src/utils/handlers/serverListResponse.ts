// @ts-expect-error Fix on a later stage
import PacketManager from '@mu-online-js/mu-packet-manager';
import structs from './../packets/index';
import {gameServersList} from '../loadGameServersList';
import {GameServer, SendDataType} from '../types';
import {Socket} from 'net';

const getActiveServerList = () => {
  const list: GameServer[] = [];
  gameServersList?.forEach((gameServer: GameServer) => {
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
 */
const serverListResponse = ({socket, sendData}: {socket: Socket, sendData: SendDataType}) => {
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
  const message = new PacketManager()
    .useStruct(structs.CSServerListResponse).toBuffer(messageStruct);
  sendData({socket, data: message, description: 'serverListResponse'});
};

export default serverListResponse;
