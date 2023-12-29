// @ts-expect-error Fix on a later stage
import PacketManager from '@mu-online-js/mu-packet-manager';
import structs from './../packets/index';
import logger from './../logger';
import {Socket} from 'net';

/**
 * Handles GameServerUserInfo request coming from GS.
 */
const gameServerUserInfoReceive = ({data, socket}: {data: Buffer, socket: Socket}): void => {
  const serverUserInfo = new PacketManager().fromBuffer(data)
    .useStruct(structs.GSJSUserInfoSend).toObject();

  const gameServerUserInfo = {
    userCount: serverUserInfo.currentUserCount,
    maxUserCount: serverUserInfo.maxUserCount,
    internalId: socket.remotePort
  };
  if (process.env.DEBUG_GS) {
    logger.info(gameServerUserInfo);
  }
};

export default gameServerUserInfoReceive;
