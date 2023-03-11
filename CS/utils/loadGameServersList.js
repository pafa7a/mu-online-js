const importFresh = require("import-fresh");
let gameServersList = [];

const loadGameServersList = () => {
  const serverList = importFresh('../config/ServerList.json');
  gameServersList.splice(0, gameServersList.length, ...serverList);
}

module.exports = {
  loadGameServersList,
  gameServersList,
}
