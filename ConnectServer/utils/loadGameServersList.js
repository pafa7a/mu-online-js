const importFresh = require("import-fresh");
let gameServersList = [];

const loadGameServersList = () => {
  const serverList = importFresh('../config/ServerList.json');
  gameServersList.splice(0, gameServersList.length, ...serverList);
}

const addGameServer = data => {
  gameServersList.forEach(server => {
    if (server.id === data.serverCode) {
      if (!server.state) {
        console.log(`GameServer connected. Name: "${server.name}"; ServerCode: "${server.id}"`);
        server.state = 1;
      }
      server.userTotal = data.userTotal;
      server.userCount = data.userCount;
    }
  })
}

module.exports = {
  loadGameServersList,
  gameServersList,
  addGameServer
}
