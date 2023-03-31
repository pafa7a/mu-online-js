const { connect } = require('net');
const {loadGameServersList} = require('./../utils/loadGameServersList');
const {startServer, stopServer} = require('./../utils/tcp');
const byteToNiceHex = require("./../utils/byteToNiceHex");
const assert = require('assert');
const mock = require('mock-fs');
const packetManager = require('@mu-online-js/mu-packet-manager');
const structs = packetManager.getStructs();

describe('TCP Socket Server', () => {
  let client;

  before(() => {
    // Mock the file system to provide a fake implementation of config/ServerList.json
    mock({
      'config/ServerList.json': JSON.stringify(
        [
          {
            "id": 0,
            "name": "GameServer",
            "IP": "127.0.0.1",
            "port": 55901,
            "show": true,
            "state": 1,
            "userTotal": 20
          }
        ]
      )
    });
    loadGameServersList();
  });

  beforeEach(done => {
    // Start the TCP server on port 44405.
    startServer(44405);

    // Connect to the server with a client socket
    client = connect({port: 44405}, () => {
      console.log('Client connected');
    });

    // Wait for the server to send the "Hello" message
    client.once('data', (data) => {
      console.log(`Received data from server: ${byteToNiceHex(data)}`);
      done();
    });
  });

  afterEach(() => {
    // Close the client socket
    client.destroy();

    // Close the TCP server.
    stopServer();
  });

  after(() => {
    // Restore the original file system
    mock.restore();
  });

  it('should respond with server list when receiving the requestServerList request', done => {
    // Send the "server list" message to the server
    const messageStruct = {
      header: {
        type: 0xC1,
        size: 'auto',
        headCode: 0xF4,
        subCode: 0x06,
      },
    }
    const message = new packetManager()
      .useStruct(structs.MainCSSendServerListRequest).toBuffer(messageStruct);
    client.write(message);

    // Wait for the server to send the server list response
    client.once('data', (data) => {
      console.log(`Received data from server: ${byteToNiceHex(data)}`);

      // Verify that the response is correct.
      const messageStruct = {
        header: {
          type: 0xC2,
          size: 'auto',
          headCode: 0xF4,
          subCode: 0x06,
        },
        serverCount: 1,
        serverLoadInfo: [{
          serverId: 0,
          loadPercentage: 20
        }]
      }
      const expectedResponseBuffer = new packetManager()
        .useStruct(structs.CSServerListResponse).toBuffer(messageStruct);
      assert.deepStrictEqual(data, expectedResponseBuffer);

      done();
    });
  });

  it('should respond with server info when receiving the correct message for server with ID 0', done => {
    // Send the "server info" message to the server.
    // Request info for server 0.
    const messageStruct = {
      header: {
        type: 0xC1,
        size: 'auto',
        headCode: 0xF4,
        subCode: 0x03,
      },
      serverId: 0,
    }
    const messageBuffer = new packetManager()
      .useStruct(structs.MainCSServerInfoRequest).toBuffer(messageStruct);
    client.write(messageBuffer);

    // Wait for the server to send the server info response
    client.once('data', (data) => {
      console.log(`Received data from server: ${byteToNiceHex(data)}`);

      const responseStruct = {
        header: {
          type: 0xC1,
          size: 'auto',
          headCode: 0xF4,
          subCode: 0x03,
        },
        serverAddress: '127.0.0.1',
        serverPort: '55901',
      }
      const expectedResponseBuffer = new packetManager()
        .useStruct(structs.CSMainCSServerInfoResponse).toBuffer(responseStruct);

      // Verify that the response is correct.
      assert.deepStrictEqual(data, expectedResponseBuffer);

      done();
    });
  });

});
