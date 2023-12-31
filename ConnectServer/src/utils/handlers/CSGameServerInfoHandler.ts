// @ts-expect-error Fix on a later stage
import PacketManager from '@mu-online-js/mu-packet-manager';
import structs from './../packets/index';
import {addGameServer} from '../loadGameServersList';

/**
 * Handles CSGameServerInfoHandler request coming from GS.
 */
const CSGameServerInfoHandler = ({data, remoteInfo: {address, port}}: {data: Buffer, remoteInfo: {address: string, port: number}}): void => {
  const serverInfo = new PacketManager().fromBuffer(data)
    .useStruct(structs.CSGameServerInfo)
    .toObject();
  addGameServer(serverInfo, address, port);
};

export default CSGameServerInfoHandler;
