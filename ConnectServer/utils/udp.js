const { createSocket } = require('dgram');
const byteToNiceHex = require("./byteToNiceHex");
const {addGameServer} = require("./loadGameServersList");

let udpServer;
const startServer = port => {
  udpServer = createSocket('udp4');
  udpServer.on('message', (data) => {
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
      handler(data, udpServer);
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
  udpServer.close();
}

const gameServerInfoHandler = (data, socket) => {
  const serverInfo = {
    serverCode: data.readUintLE(4, 1),
    userTotal: data.readUintLE(6, 1),
    userCount: data.readUintLE(8, 2),
    accountCount: data.readUintLE(10, 2),
    pcPointCount: data.readUintLE(12, 2),
    maxUserCount: data.readUintLE(14, 2),
  }
  addGameServer(serverInfo);
}

module.exports = {
  startServer,
  stopServer
};
