const { createServer } = require('net');
const byteToNiceHex = require('./byteToNiceHex');
const packetManager = require('mu-packet-manager');
const structs = packetManager.getStructs();

let tcpServer;
const tcpSockets = new Map();

const startServer = port => {
  tcpServer = createServer((socket) => {
    // Store the socket in map.
    tcpSockets.set(socket, true);

    if (process.env.DEBUG) {
      console.log(`New client connected. IP: ${socket.remoteAddress}`);
    }

    socket.on("data", (data) => {
      let handler;
      switch (data[0]) {
        case 0xC1:
          switch (data[2]) {
            case 0x00:
              // game server info receive
              handler = gameServerInfoReceive
              break;
            case 0x01:
              handler = gameServerConnectAccountReceive
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
            case 0x10:
              // GJMapServerMoveCancelRecv
              break;
            case 0x11:
              // GJAccountLevelSaveRecv
              break;
            case 0x12:
              // GJAccountLockSaveRecv
              break;
            case 0x20:
              handler = gameServerUserInfoReceive
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

  tcpServer.listen(port, () => {
    console.log(`TCP socket server is running on port: ${port}`);
  });
}

const stopServer = () => {
  tcpServer.close();
}

/**
 * Helper function that logs the bytes in HEX format upon sending data.
 * @param {Socket} socket
 * @param {Object} data
 * @param {String} description
 */
const sendData = (socket, data, description = '') => {
  const buffer = Buffer.from(data);
  socket.write(buffer);
  if (process.env.DEBUG) {
    console.log(`Sent [${description}]:`, byteToNiceHex(data));
  }
}

/**
 * Helper function that logs the bytes in HEX format upon receive.
 * @param {Socket} socket
 * @param {Object} data
 * @param {Function | String} handler
 */
const onReceive = (socket, data, handler) => {
  const hexString = byteToNiceHex(data);
  let handlerName = 'Unknown';
  if (typeof handler === 'function') {
    handlerName = handler.name;
  }

  if (process.env.DEBUG) {
    console.log(`Received [${handlerName}]:`, hexString);
  }
}

/**
 * Handles GameServerInfo request coming from GS.
 * @param {Buffer} data
 * @param {Socket} socket
 */
const gameServerInfoReceive = (data, socket) => {
  const serverInfo = new packetManager().fromBuffer(data)
    .useStruct(structs.GSJSServerInfoSend).toObject();
  const gameServerInfo = {
    serverType: serverInfo.serverType,
    serverPort: serverInfo.serverPort,
    serverName: serverInfo.serverName,
    serverCode: serverInfo.serverCode,
    internalId: socket.remotePort
  }
  console.log(gameServerInfo)
}

/**
 * Handles GameServerUserInfo request coming from GS.
 * @param {Buffer} data
 * @param {Socket} socket
 */
const gameServerUserInfoReceive = (data, socket) => {
  const serverUserInfo = new packetManager().fromBuffer(data)
    .useStruct(structs.GSJSUserInfoSend).toObject();

  const gameServerUserInfo = {
    userCount: serverUserInfo.currentUserCount,
    maxUserCount: serverUserInfo.maxUserCount,
    internalId: socket.remotePort
  }
  console.log(gameServerUserInfo)
}

/**
 * Handles GameServerConnectAccountReceive request coming from GS.
 * @param {Buffer} data
 * @param {Socket} socket
 */
const gameServerConnectAccountReceive = (data, socket) => {
  const accountInfo = new packetManager().fromBuffer(data)
    .useStruct(structs.GSJSConnectAccountSend).toObject();
  console.log(accountInfo)

  const responseStruct = {
    header: {
      type: 0xC1,
      size: 'auto',
      headCode: 0x01,
    },
    playerIndex: accountInfo.playerIndex,
    account: accountInfo.account,
    personalCode: '1234',
    result: 0,
    blockCode: 0,
    accountLevel: 0,
    accountExpireDate: 'someexpire',
    lock: 0,
  }

  const responseBuffer = new packetManager()
    .useStruct(structs.JSGSConnectAccountSend).toBuffer(responseStruct)
  sendData(socket, responseBuffer, 'send login result')
}

module.exports = {
  startServer,
  tcpSockets,
  stopServer
}
