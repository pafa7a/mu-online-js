const net = require('net');
const byteToNiceHex = require('./byteToNiceHex');
const protocol = require('./protocol')
const {gameServersList} = require('./loadGameServersList');

let tcpServer;
const tcpSockets = new Map();

const startServer = port => {
  tcpServer = net.createServer((socket) => {
    // Store the socket in map.
    tcpSockets.set(socket, true);

    socket.sendData = (data, description = '') => {
      const buffer = Buffer.from(data);
      socket.write(buffer);
      if (process.env.DEBUG) {
        console.log(`Sent [${description}]:`, byteToNiceHex(data));
      }
    }

    socket.onReceive = (data, handler) => {
      const hexString = byteToNiceHex(data);
      let handlerName = 'Unknown';
      if (typeof handler === 'function') {
        handlerName = handler.name;
      }

      if (process.env.DEBUG) {
        console.log(`Received [${handlerName}]:`, hexString);
      }
    }

    if (process.env.DEBUG) {
      console.log(`New client connected. IP: ${socket.remoteAddress}`);
    }
    // send Hello
    socket.sendData(protocol.sayHello, 'sayHello');

    socket.on("data", (data) => {
      let handler;
      switch (data[0]) {
        case 0xC1:
          switch (data[2]) {
            case 0xF4:
              switch (data[3]) {
                case 0x03:
                  handler = serverInfoResponse;
                  break;
                case 0x06:
                  handler = serverListResponse;
                  break;
              }
              break;
          }
          break;
      }
      socket.onReceive(data, handler);
      if (handler) {
        handler(data, socket);
      }
    });

    socket.on("end", () => {
      // Remove the socket from the map.
      tcpSockets.delete(socket);
      console.log("Client disconnected");
    });

    socket.on("error", (error) => {
      // Remove the socket from the map.
      tcpSockets.delete(socket);
      if (error?.code !== 'ECONNRESET') {
        console.log(`Socket Error: ${error.message}`);
      }
    });

  });
  tcpServer.on("error", (error) => {
    console.log(`Server Error: ${error.message}`);
  });

  tcpServer.on("close", () => {
    console.log(`Stopping the server.`);
  });

  tcpServer.listen(port, () => {
    console.log(`TCP socket server is running on port: ${port}`);
  });
}

const serverListResponse = (data, socket) => {
  let buffer = Buffer.from([0xC2, 0x00, 0x00, 0xF4, 0x06, 0x00, 0x00]);

  const gsList = getServerListResponseBufferAndLength();
  buffer = Buffer.concat([buffer, gsList.buffer]);

  buffer.writeUIntBE(gsList.count, 5, 2);
  buffer[2] = buffer.length;
  socket.sendData(buffer, 'serverListResponse');
}

const serverInfoResponse = (data, socket) => {
  const serverId = data.readUIntLE(4, 2);
  gameServersList.forEach(gameServer => {
    if (gameServer.id === serverId) {
      let buffer = Buffer.from([0xC1, 0x00, 0xF4, 0x03]);
      const IPBuffer = Buffer.alloc(16)
      IPBuffer.write(gameServer['IP']);
      const portBuffer = Buffer.alloc(2);
      portBuffer.writeUIntLE(gameServer.port, 0, 2);
      buffer = Buffer.concat([buffer, IPBuffer, portBuffer]);
      buffer[1] = buffer.length;
      socket.sendData(buffer, 'serverListResponse');
    }
  })
}

const getServerListResponseBufferAndLength = () => {
  const gsBuffers = [];
  gameServersList.forEach(gameServer => {
    if (gameServer.show) {
      const buffer = Buffer.alloc(4);
      buffer.writeUIntLE(gameServer.id, 0, 2);
      buffer.writeUIntBE(20, 2, 1);
      buffer.writeUIntBE(0xC1, 3, 1);
      gsBuffers.push(buffer);
    }
  });
  return {
    buffer: Buffer.concat(gsBuffers),
    count: gsBuffers.length
  }
}

const stopServer = () => {
  tcpServer.close();
}

module.exports = {
  startServer,
  tcpSockets,
  serverListResponse,
  stopServer
}
