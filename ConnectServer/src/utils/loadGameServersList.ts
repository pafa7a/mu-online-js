import logger from './logger';
import {sendData, tcpSockets} from './tcp';
import serverListResponse from './handlers/serverListResponse';
import {Socket} from 'net';
import {GameServer} from './types';
import ServerList from '../config/ServerList.json';

const gameServersList: GameServer[] = [];

const loadGameServersList = () => {
  const serverList: GameServer[] = ServerList;
  gameServersList.splice(0, gameServersList.length, ...serverList);
};

const addGameServer = (data: GameServer, address: string, port: number) => {
  gameServersList.forEach(server => {
    if (server.id === data.serverCode) {
      if (!server.address || !server.internalPort || !server.state) {
        server.address = address;
        server.internalPort = port;
        server.state = true;
        logger.info(`GameServer connected. Name: "${server.name}"; ServerCode: "${server.id}; InternalAddress: ${server.address}; InternalPort: ${server.internalPort}"`);
        reloadGameServersList();
      }
      server.userTotal = data.userTotal;
      server.userCount = data.userCount;
      server.lastMessageTime = Date.now();
    }
  });
};

const removeGameServer = (server: GameServer) => {
  server.state = false;
  server.address = server.internalPort = server.lastMessageTime = undefined;
  logger.info(`GameServer disconnected. Name: "${server.name}"; ServerCode: "${server.id}`);
  reloadGameServersList();
};

const reloadGameServersList = () => {
  // send a message to all connected clients
  tcpSockets.forEach((_, socket: Socket) => {
    serverListResponse({socket, sendData});
  });
};

export {
  loadGameServersList,
  gameServersList,
  addGameServer,
  removeGameServer,
  reloadGameServersList
};
