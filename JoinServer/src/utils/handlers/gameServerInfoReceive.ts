// @ts-expect-error Fix on a later stage
import PacketManager from '@mu-online-js/mu-packet-manager';
import structs from './../packets';
import logger from './../logger';
import {Socket} from 'net';
import { env } from 'node:process';

/**
 * Handles GameServerInfo request coming from GS.
 */
const gameServerInfoReceive = ({ data, socket }: { data: Buffer, socket: Socket }): void => {
  const serverInfo = new PacketManager().fromBuffer(data)
    .useStruct(structs.GSJSServerInfoSend).toObject();
  const gameServerInfo = {
    serverType: serverInfo.serverType,
    serverPort: serverInfo.serverPort,
    serverName: serverInfo.serverName,
    serverCode: serverInfo.serverCode,
    internalId: socket.remotePort
  };
  if (env.DEBUG_GS) {
    logger.info(gameServerInfo);
  }
};

export default gameServerInfoReceive;
