const importFresh = require("import-fresh");
let gameServersList = [];

const loadGameServersList = () => {
  const serverList = importFresh('../config/ServerList.json');
  gameServersList.splice(0, gameServersList.length, ...serverList);
}

const addGameServer = (data, address, port) => {
  gameServersList.forEach(server => {
    if (server.id === data.serverCode) {
      if (!server.address || !server.port || !server.state) {
        server.address = address;
        server.port = port;
        server.state = 1;
        console.log(`GameServer connected. Name: "${server.name}"; ServerCode: "${server.id}; Address: ${address}; Port: ${port}"`);
      }
      server.userTotal = data.userTotal;
      server.userCount = data.userCount;
      server.lastMessageTime = Date.now();
    }
  })
}

module.exports = {
  loadGameServersList,
  gameServersList,
  addGameServer
}
