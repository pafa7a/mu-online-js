import {createSocket, Socket} from 'dgram';
import byteToNiceHex from './byteToNiceHex';
import {gameServersList, removeGameServer} from './loadGameServersList';
import CSGameServerInfoHandler from './handlers/CSGameServerInfoHandler';
import logger from './logger';
import {env} from 'node:process';
import {PacketHandlersUdp} from './types';

const CLIENT_TIMEOUT = 10000;

let udpServer: Socket;

const startServer = (port: number) => {
  udpServer = createSocket('udp4');
  udpServer.on('message', (data, remoteInfo) => {
    const packetType = data[0];
    let packetHead = data[2];

    if (packetType === 0xC2) {
      packetHead = data[3];
    }

    const packetHandlers: PacketHandlersUdp = {
      0xC1: {
        0x01: CSGameServerInfoHandler,
      },
    };

    const handler = packetHandlers[packetType]?.[packetHead];
    onReceive({data, handler});
    if (handler) {
      handler({data, remoteInfo});
    }
  });

  udpServer.bind(port, () => {
    logger.info('UDP server listening on port 55557');
  });
};

/**
 * Helper function triggered when a new data is received.
 */
const onReceive = ({data, handler}: {data: Buffer, handler: object|string}) => {
  const hexString = byteToNiceHex(data);
  let handlerName = 'Unknown';
  if (typeof handler === 'function') {
    handlerName = handler.name;
  }

  if (env.DEBUG_UDP && handlerName === 'Unknown') {
    logger.info(`Received [${handlerName}]: ${hexString}`);
  }
};

const stopServer = () => {
  clearInterval(intervalId);
  udpServer.close();
};

/**
 * Check periodically if the GameServer is still running.
 */
const intervalId = setInterval(() => {
  const now = Date.now();
  gameServersList.forEach(server => {
    // If the server was ever connected.
    if (server.internalPort && server.address && server.lastMessageTime) {
      // Check if the last message was received for more than the timeout limit.
      if (now - server.lastMessageTime > CLIENT_TIMEOUT) {
        removeGameServer(server);
      }
    }
  });
}, 5000);

export {
  startServer,
  stopServer
};
