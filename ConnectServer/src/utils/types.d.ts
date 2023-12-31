import {Socket} from 'net';
import {RemoteInfo} from 'dgram';

export interface GameServer {
  id?: number,
  name?: string,
  serverCode?: number,
  address?: string,
  internalPort?: number,
  state?: boolean,
  userTotal?: number,
  userCount?: number,
  lastMessageTime?: number,
  IP?: string,
  port?: number,
  serverId?: number,
  show?: boolean,
  loadPercentage?: number,
}

interface SendData {
  socket: Socket,
  data: Buffer,
  description?: string,
  rawData?: object,
}

export type SendDataType = (arg: SendData) => void;

export interface PacketHandlersUdp {
  [packetType: number]: {
    [packetHead: number]: (options: {data: Buffer, remoteInfo: RemoteInfo }) => void;
  };
}

export interface PacketHandlersTcp {
  [packetType: number]: {
    [packetHead: number]: {
      [packetSub: number]: (options: {data: Buffer, socket: Socket, sendData: typeof sendData}) => void
    };
  };
}
