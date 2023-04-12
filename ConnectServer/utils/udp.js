const {createSocket} = require('dgram');
const byteToNiceHex = require('./byteToNiceHex');
const {addGameServer, gameServersList, removeGameServer} = require('./loadGameServersList');
const packetManager = require('@mu-online-js/mu-packet-manager');
const structs = packetManager.getStructs();

const CLIENT_TIMEOUT = 10000;

let intervalId;
let udpServer;
const startServer = port => {
  udpServer = createSocket('udp4');
  udpServer.on('message', (data, remoteInfo) => {
    let handler;
    switch (data[0]) {
    case 0xC1:
      switch (data[2]) {
      case 0x01:
        handler = CSGameServerInfoHandler;
        break;
      }
      break;
    }
    onReceive(data, handler);
    if (handler) {
      handler(data, remoteInfo.address, remoteInfo.port);
    }
  });


  udpServer.bind(port, () => {
    console.log('UDP server listening on port 55557');
  });
};

const onReceive = (data, handler) => {
  const hexString = byteToNiceHex(data);
  let handlerName = 'Unknown';
  if (typeof handler === 'function') {
    handlerName = handler.name;
  }

  if (process.env.DEBUG_UDP && handlerName === 'Unknown') {
    console.log(`Received [${handlerName}]:`, hexString);
  }
};

const stopServer = () => {
  clearInterval(intervalId);
  udpServer.close();
};

const CSGameServerInfoHandler = (data, address, port) => {
  const serverInfo = new packetManager().fromBuffer(data)
    .useStruct(structs.CSGameServerInfo)
    .toObject();
  addGameServer(serverInfo, address, port);
};

/**
 * Check periodically if the GameServer is still running.
 */
intervalId = setInterval(() => {
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

module.exports = {
  startServer,
  stopServer
};
