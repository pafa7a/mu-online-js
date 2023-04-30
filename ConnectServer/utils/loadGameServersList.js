const importFresh = require('import-fresh');
const logger = require('./logger');
let gameServersList = [];

const loadGameServersList = () => {
  const serverList = importFresh('../config/ServerList.json');
  gameServersList.splice(0, gameServersList.length, ...serverList);
};

const addGameServer = (data, address, port) => {
  gameServersList.forEach(server => {
    if (server.id === data.serverCode) {
      if (!server.address || !server.internalPort || !server.state) {
        server.address = address;
        server.internalPort = port;
        server.state = 1;
        logger.info(`GameServer connected. Name: "${server.name}"; ServerCode: "${server.id}; InternalAddress: ${server.address}; InternalPort: ${server.internalPort}"`);
      }
      server.userTotal = data.userTotal;
      server.userCount = data.userCount;
      server.lastMessageTime = Date.now();
    }
  });
};

const removeGameServer = server => {
  server.state = 0;
  server.address = server.internalPort = server.lastMessageTime = undefined;
  logger.info(`GameServer disconnected. Name: "${server.name}"; ServerCode: "${server.id}`);
};

module.exports = {
  loadGameServersList,
  gameServersList,
  addGameServer,
  removeGameServer
};
