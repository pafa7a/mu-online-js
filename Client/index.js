const {connect} = require('tls');
const events = require('events');
const byteToNiceHex = require('./src/utils/byteToNiceHex');
const structs = require('./src/packets/index');
const packetManager = require('@mu-online-js/mu-packet-manager');
const readline = require('readline');
const getTickCount = require('./src/utils/getTickCount');
const loginMessage = require('./src/enums/loginMessage');
const {readFileSync} = require('fs');

let globalStorage = {
  connectServerPort: 44405,
  version: '10405',
  serial: 'TbYehR2hFUPBKgZj',
};

console.log(`ClientVersion: ${globalStorage.version}`);
console.log(`Serial: ${globalStorage.serial}`);

const tlsOptions = {
  ca: readFileSync('./../ssl/cert.pem'),
  host: '127.0.0.1',
};

const ask = (query, hidden = false) => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  if (hidden) {
    let t = true;
    rl._writeToOutput = (a) => {
      if (t) {
        rl.output.write(a);
        t = false;
      }
    };
  }
  return new Promise(resolve => rl.question(query, ans => {
    if (hidden) rl.output.write('\n\r');
    rl.close();
    resolve(ans);
  }));
};

const emitter = new events.EventEmitter();
const ConnectServerNet = connect({...tlsOptions, port: globalStorage.connectServerPort}, () => {
  console.log(`Connected successfully to ConnectServer on port ${globalStorage.connectServerPort}`);
});

// Wait for the server to send the "Hello" message
ConnectServerNet.on('data', data => {
  emitter.emit('receivePacketFromConnectServer', data);
});

emitter.on('sendPacketToConnectServer', data => {
  ConnectServerNet.write(data);
});

emitter.on('receivePacketFromConnectServer', buffer => {
  let handler;
  const packetType = buffer[0];
  let packetHead = buffer[2];
  let packetSub = buffer[3];

  if (packetType === 0xC2) {
    packetHead = buffer[3];
    packetSub = buffer[4];
  }

  const packetHandlers = {
    0xC1: {
      0x00: {
        // Received from ConnectServer once the TCP client is connected.
        0x01: receiveHelloFromConnectServer,
      },
      0xF4: {
        // Received from ConnectServer once a specific server info is requested.
        0x03: receiveServerInfoFromConnectServer,
      },
    },
    0xC2: {
      0xF4: {
        // Received from ConnectServer once the server list was requested.
        0x06: receiveServerListFromConnectServer,
      },
    },
  };
  
  handler = packetHandlers[packetType]?.[packetHead]?.[packetSub];

  if (handler) {
    handler(buffer);
  } else {
    console.log(`Unknown packet: ${byteToNiceHex(buffer)}`);
  }

});
emitter.on('receivePacketFromGameServer', buffer => {
  let handler;
  const packetType = buffer[0];
  let packetHead = buffer[2];
  let packetSub = buffer[3];

  if (packetType === 0xC2) {
    packetHead = buffer[3];
    packetSub = buffer[4];
  }

  const packetHandlers = {
    0xC1: {
      0xF1: {
        // Received from GameServer once a connection is established.
        0x00: receiveOpenLoginScreen,
        0x01: receiveLoginResponse,
      },
    },
  };
  
  handler = packetHandlers[packetType]?.[packetHead]?.[packetSub];

  if (handler) {
    handler(buffer);
  } else {
    console.log(`Unknown packet: ${byteToNiceHex(buffer)}`);
  }

});

const receiveHelloFromConnectServer = () => {
  console.log('Received the welcome message from ConnectServer');

  const messageStruct = {
    header: {
      type: 0xC1,
      size: 'auto',
      headCode: 0xF4,
      subCode: 0x06,
    },
  };

  const message = new packetManager()
    .useStruct(structs.MainCSSendServerListRequest).toBuffer(messageStruct);
  emitter.emit('sendPacketToConnectServer', message);
};

const receiveServerListFromConnectServer = async (buffer) => {
  console.log('Received the server list from ConnectServer');
  const serverListInitial = new packetManager().fromBuffer(buffer).useStruct(structs.CSServerListResponse).toObject();
  globalStorage.serverList = {...serverListInitial};
  globalStorage.serverList.serverLoadInfo = [];

  // Extract the server list array from the buffer based on server count.
  let offset = 7;
  for (let i = 0; i < globalStorage.serverList.serverCount; i++) {
    globalStorage.serverList.serverLoadInfo.push({
      serverId: buffer.readUInt16LE(offset),
      loadPercentage: buffer.readUInt8(offset + 2)
    });
    offset += 4;
  }

  const selectServerId = async (callback) => {
    console.log('Servers list:');
    globalStorage.serverList.serverLoadInfo.forEach(server => {
      console.log(`[${server.serverId}] (${server.loadPercentage})`);
    });
    let selectedServerId = await ask('Enter the server ID that you want to connect with: ');
    selectedServerId = parseInt(selectedServerId);
    // Validate input.
    if (!globalStorage.serverList.serverLoadInfo.some((item) => item.serverId === selectedServerId)) {
      console.log('Please enter a valid server ID.');
      await selectServerId(callback);
    } else {
      callback(selectedServerId);
    }
  };

  await selectServerId(serverId => {
    globalStorage.serverId = serverId;
    const messageStruct = {
      header: {
        type: 0xC1,
        size: 'auto',
        headCode: 0xF4,
        subCode: 0x03,
      },
      serverId: serverId
    };
    const message = new packetManager()
      .useStruct(structs.MainCSServerInfoRequest).toBuffer(messageStruct);
    emitter.emit('sendPacketToConnectServer', message);
  });

};

const receiveServerInfoFromConnectServer = async (buffer) => {
  const serverInfo = new packetManager().fromBuffer(buffer).useStruct(structs.CSMainCSServerInfoResponse).toObject();
  globalStorage.serverAddress = serverInfo.serverAddress;
  globalStorage.serverPort = serverInfo.serverPort;
  console.log('Received the following data for the server:');
  console.log(`IP: ${serverInfo.serverAddress}; Port: ${serverInfo.serverPort}`);
  console.log('Closing the connection with the ConnectServer.');
  // Close the connection with CS and start a GS connection.
  ConnectServerNet.end();
  // Wait for the TCP connection with the GS.
  await connectToGS();
};

const connectToGS = () => {
  return new Promise(resolve => {
    const GameServerNet = connect({...tlsOptions, port: globalStorage.serverPort}, () => {
      console.log(`Connected successfully to GameServer on port ${globalStorage.serverPort}`);
      resolve(true);
    });

    GameServerNet.on('data', data => {
      emitter.emit('receivePacketFromGameServer', data);
    });

    GameServerNet.on('close', () => {
      console.log(`Disconnected from the GameServer (${globalStorage.serverId}) on port ${globalStorage.serverPort}.`);
    });

    GameServerNet.on('error', error => {
      console.log(`Error while connecting with the GameServer: ${error}`);
    });

    emitter.on('sendPacketToGameServer', data => {
      GameServerNet.write(data);
    });
  });
};

const loadLoginScreen = async () => {
  const username = await ask('Username: ');
  const password = await ask('Password: ', true);
  const messageStruct = {
    header: {
      type: 0xC3,
      size: 'auto',
      headCode: 0xF1,
      subCode: 0x01,
    },
    username,
    password,
    tickCount: getTickCount(),
    version: globalStorage.version,
    serial: globalStorage.serial,
  };

  const message = new packetManager()
    .useStruct(structs.RequestLogin).toBuffer(messageStruct);
  emitter.emit('sendPacketToGameServer', message);
};

const receiveLoginResponse = buffer => {
  const data = new packetManager().fromBuffer(buffer).useStruct(structs.LoginResult).toObject();
  const {result} = data;
  if (result === loginMessage.LOG_IN_FAIL_VERSION) {
    console.log('Invalid version or serial. Closing the client.');
    process.exit();
  }
  //@TODO: handle the rest.
};

const receiveOpenLoginScreen = async () => {
  await loadLoginScreen();
};
