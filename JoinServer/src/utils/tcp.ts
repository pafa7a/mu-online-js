import {Server, createServer, Socket} from 'net';
import byteToNiceHex from './byteToNiceHex';
import gameServerConnectAccountReceive from './handlers/gameServerConnectAccountReceive';
import gameServerInfoReceive from './handlers/gameServerInfoReceive';
import gameServerUserInfoReceive from './handlers/gameServerUserInfoReceive';
import logger from './logger';
import { env } from 'node:process';

let tcpServer: Server;
const tcpSockets: Map<number, Socket> = new Map();

interface PacketHandlers {
  [packetType: number]: {
    [packetHead: number]: (options: { data: Buffer, socket: Socket, sendData: typeof sendData }) => void;
  };
}

const startServer = (port: number) => {
  tcpServer = createServer((socket: Socket) => {
    // Store the socket in map.
    if (socket.remotePort) {
      tcpSockets.set(socket.remotePort, socket);
    }

    if (env.DEBUG) {
      logger.info(`New client connected. IP: ${socket.remoteAddress}`);
    }

    socket.on('data', (data) => {
      const packetType = data[0];
      const packetHead = data[2];

      const packetHandlers: PacketHandlers = {
        0xC1: {
          0x00: gameServerInfoReceive,
          0x01: gameServerConnectAccountReceive,
          // 0x02: {
          //   // disconnect account receive
          // },
          // 0x03: {
          //   // map server move receive
          // },
          // 0x04: {
          //   // map server move auth receive
          // },
          // 0x05: {
          //   // account level receive
          // },
          // 0x06: {
          //   // account level receive 2
          // },
          // 0x10: {
          //   // GJMapServerMoveCancelReceive
          // },
          // 0x11: {
          //   // GJAccountLevelSaveReceive
          // },
          // 0x12: {
          //   // GJAccountLockSaveReceive
          // },
          0x20: gameServerUserInfoReceive,
          // 0x30: {
          //   // account already connected receive
          // },
        },
      };

      const handler = packetHandlers[packetType]?.[packetHead];
      onReceive({data, handler});
      if (handler) {
        handler({data, socket, sendData});
      }
    });

    socket.on('end', () => {
      // Remove the socket from the map.
      if (socket.remotePort) {
        tcpSockets.delete(socket.remotePort);
      }
      logger.info('GameServer disconnected');
    });

    socket.on('error', (error) => {
      // Remove the socket from the map.
      if (socket.remotePort) {
        tcpSockets.delete(socket.remotePort);
      }
      logger.info(`Socket Error: ${error.message}`);
    });

  });
  tcpServer.on('error', (error) => {
    logger.info(`Server Error: ${error.message}`);
  });

  tcpServer.listen(port, () => {
    logger.info(`TCP socket server is running on port: ${port}`);
  });
};

const stopServer = () => {
  tcpServer.close();
};

/**
 * Helper function that logs the bytes in HEX format upon sending data.
 */
const sendData = ({socket, data, description = '', rawData = {}}: {socket: Socket, data: Buffer, description: string, rawData: object}) => {
  const buffer = Buffer.from(data);
  socket.write(buffer);
  if (env.DEBUG) {
    logger.info(`Sent [${description}]: ${byteToNiceHex(data)}`);
  }
  if (env.DEBUG_VERBOSE) {
    logger.info(JSON.stringify(rawData, null, 2));
  }
};

/**
 * Helper function that logs the bytes in HEX format upon receive.
 */
const onReceive = ({data, handler}: {data: Buffer, handler: object|string}) => {
  const hexString = byteToNiceHex(data);
  let handlerName = 'Unknown';
  if (typeof handler === 'function') {
    handlerName = handler.name;
  }

  if (env.DEBUG) {
    logger.info(`Received [${handlerName}]: ${hexString}`);
  }
};

export {
  startServer,
  tcpSockets,
  stopServer
};
