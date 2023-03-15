const {createSocket} = require('dgram');
const byteToNiceHex = require("./byteToNiceHex");
const {addGameServer, gameServersList} = require("./loadGameServersList");
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
            handler = gameServerInfoHandler;
            break;
        }
        break;
    }
    udpServer.onReceive(data, handler);
    if (handler) {
      handler(data, remoteInfo.address, remoteInfo.port);
    }
  });

  udpServer.onReceive = (data, handler) => {
    const hexString = byteToNiceHex(data);
    let handlerName = 'Unknown';
    if (typeof handler === 'function') {
      handlerName = handler.name;
    }

    if (process.env.DEBUG_UDP) {
      console.log(`Received [${handlerName}]:`, hexString);
    }
  }

  udpServer.bind(port, () => {
    console.log('UDP server listening on port 55557');
  });
}

const stopServer = () => {
  clearInterval(intervalId);
  udpServer.close();
}

const gameServerInfoHandler = (data, address, port) => {
  const serverInfo = {
    serverCode: data.readUintLE(4, 2),
    userTotal: data.readUintLE(6, 1),
    userCount: data.readUintLE(8, 2),
    accountCount: data.readUintLE(10, 2),
    pcPointCount: data.readUintLE(12, 2),
    maxUserCount: data.readUintLE(14, 2),
  }
  addGameServer(serverInfo, address, port);
}

/**
 * Check periodically if the GameServer is still running.
 */
intervalId = setInterval(() => {
  const now = Date.now();
  gameServersList.forEach(server => {
    // If the server was ever connected.
    if (server.port && server.address && server.lastMessageTime) {
      // Check if the last message was received for more than the timeout limit.
      if (now - server.lastMessageTime > CLIENT_TIMEOUT) {
        server.state = 0;
        server.address = server.port = server.lastMessageTime = undefined;
      }
    }
  })
}, 5000);

module.exports = {
  startServer,
  stopServer
};
