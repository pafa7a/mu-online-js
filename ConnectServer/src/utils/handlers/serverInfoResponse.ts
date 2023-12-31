// @ts-expect-error Fix on a later stage
import PacketManager from '@mu-online-js/mu-packet-manager';
import structs from './../packets/index';
import { Socket } from 'net';
import {gameServersList} from '../loadGameServersList';
import {GameServer, SendDataType} from '../types';

/**
 * Handles serverInfoResponse request coming from GS.
 */
const serverInfoResponse = ({data, socket, sendData}: {data: Buffer, socket: Socket, sendData: SendDataType}) => {

  const received = new PacketManager().fromBuffer(data)
    .useStruct(structs.MainCSServerInfoRequest).toObject();
  const serverId: number = received?.serverId;
  gameServersList?.forEach((gameServer: GameServer) => {
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

      const messageBuffer = new PacketManager()
        .useStruct(structs.CSMainCSServerInfoResponse).toBuffer(messageStruct);
      sendData({socket, data: messageBuffer, description: 'serverInfoResponse'});
    }
  });
};


export default serverInfoResponse;
