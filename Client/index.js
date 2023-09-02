const {connect} = require('net');
const events = require('events');
const byteToNiceHex = require('./src/utils/byteToNiceHex');
const structs = require('./src/packets/index');
const packetManager = require('@mu-online-js/mu-packet-manager');
const readline = require('readline');

let globalStorage = {};

const rl = readline.createInterface({
  input: process.stdin, output: process.stdout, prompt: '> '
});

const emitter = new events.EventEmitter();
const CS_PORT = 44405;
const client = connect({port: CS_PORT}, () => {
  console.log(`Connected successfully to ConnectServer on port ${CS_PORT}`);
});

// Wait for the server to send the "Hello" message
client.on('data', data => {
  emitter.emit('receivePacketFromConnectServer', data);
});

emitter.on('sendPacketToConnectServer', data => {
  client.write(data);
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

  switch (packetType) {
    case 0xC1: {
      switch (packetHead) {
        case 0x00: {
          switch (packetSub) {
            case 0x01: {
              // Received from ConnectServer once the TCP client is connected.
              handler = receiveHelloFromConnectServer;
            }
              break;
          }
        }
          break;
        case 0xF4: {
          switch (packetSub) {
            case 0x03: {
              // Received from ConnectServer once a specific server info is requested.
              handler = receiveServerInfoFromConnectServer;
            }
              break;
          }
        }
          break;
      }
    }
      break;
    case 0xC2: {
      switch (packetHead) {
        case 0xF4: {
          switch (packetSub) {
            case 0x06: {
              // Received from ConnectServer once the server list was requested.
              handler = receiveServerListFromConnectServer;
            }
              break;
          }
        }
          break;
      }
    }
      break;
  }

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

const receiveServerListFromConnectServer = buffer => {
  console.log('Received the server list from ConnectServer');
  const serverListInitial = new packetManager().fromBuffer(buffer).useStruct(structs.CSServerListResponse).toObject();
  const serverList = {...serverListInitial};
  serverList.serverLoadInfo = [];

  // Extract the server list array from the buffer based on server count.
  let offset = 7;
  for (let i = 0; i < serverList.serverCount; i++) {
    serverList.serverLoadInfo.push({
      serverId: buffer.readUInt16LE(offset),
      loadPercentage: buffer.readUInt8(offset + 2)
    });
    offset += 4;
  }

  const selectServerId = callback => {
    console.log('Servers list:');
    serverList.serverLoadInfo.forEach(server => {
      console.log(`[${server.serverId}] (${server.loadPercentage})`);
    });
    rl.question('Enter the server ID that you want to connect with: ', selectedServerId => {
      selectedServerId = parseInt(selectedServerId);
      // Validate input.
      if (!serverList.serverLoadInfo.some((item) => item.serverId === selectedServerId)) {
        console.log('Please enter a valid server ID.');
        selectServerId(callback);
      } else {
        rl.close();
        callback(selectedServerId);
      }
    });
  };

  selectServerId(serverId => {
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

const receiveServerInfoFromConnectServer = buffer => {
  const serverInfo = new packetManager().fromBuffer(buffer).useStruct(structs.CSMainCSServerInfoResponse).toObject();
  globalStorage.serverAddress = serverInfo.serverAddress;
  globalStorage.serverPort = serverInfo.serverPort;
  console.log('Received the following data for the server:');
  console.log(`IP: ${serverInfo.serverAddress}; Port: ${serverInfo.serverPort}`);
};
