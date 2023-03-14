import {createServer, Server, Socket} from "net";
import byteToNiceHex from "./byteToNiceHex";
import ErrnoException = NodeJS.ErrnoException;

let tcpServer: Server;
const tcpSockets = new Map();

const startServer = (port: number) => {
  tcpServer = createServer((socket: Socket) => {
    // Store the socket in map.
    tcpSockets.set(socket, true);

    if (process.env.DEBUG) {
      console.log(`New client connected. IP: ${socket.remoteAddress}`);
    }

    socket.on("data", (data: Buffer) => {
      let handler: Function = () => {};
      switch (data[0]) {
        case 0xC1:
          switch (data[2]) {
            case 0x00:
              // game server info receive
              handler = gameServerInfoReceive
              break;
            case 0x01:
              // connect account receive
              break;
            case 0x02:
              // disconnect account receive
              break;
            case 0x03:
              // map server move receive
              break;
            case 0x04:
              // map server move auth receive
              break;
            case 0x05:
              // account level receive
              break;
            case 0x06:
              // account level receive 2
              break;
            case 0x30:
              // account already connected receive
              break;
          }
          break;
      }
      onReceive(socket, data, handler);
      if (handler) {
        handler(data, socket);
      }
    });

    socket.on("end", () => {
      // Remove the socket from the map.
      tcpSockets.delete(socket);
      console.log("GameServer disconnected");
    });

    socket.on("error", (error: ErrnoException) => {
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

  tcpServer.listen(port, () => {
    console.log(`TCP socket server is running on port: ${port}`);
  });
}

const stopServer = () => {
  tcpServer.close();
}

const sendData = (socket: Socket, data: Buffer, description: string = '') => {
  const buffer = Buffer.from(data);
  socket.write(buffer);
  if (process.env.DEBUG) {
    console.log(`Sent [${description}]:`, byteToNiceHex(data));
  }
}

const onReceive = (socket: Socket, data: Buffer, handler: Function) => {
  const hexString = byteToNiceHex(data);
  let handlerName = 'Unknown';
  if (typeof handler === 'function') {
    handlerName = handler.name;
  }

  if (process.env.DEBUG) {
    console.log(`Received [${handlerName}]:`, hexString);
  }
}

const gameServerInfoReceive = (data: Buffer, socket: Socket) => {
  const gameServerInfo = {
    serverType: data.readUInt8(3),
    serverPort: data.readUIntLE(4, 2),
    serverName: data.toString('utf8', 6, 56).replace(/\x00.*$/g, ''),
    serverCode: data.readUIntLE(56, 2),
    socket
  }
  console.log(gameServerInfo)
}

export {
  startServer,
  tcpSockets,
  stopServer
}
