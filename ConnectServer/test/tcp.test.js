const net = require('net');
const {loadGameServersList} = require('../utils/loadGameServersList');
const {startServer, stopServer} = require('../utils/tcp');
const byteToNiceHex = require("../utils/byteToNiceHex");
const assert = require('assert');
const mock = require('mock-fs');

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
    client = net.connect({port: 44405}, () => {
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
    const message = Buffer.from([0xC1, 0x04, 0xF4, 0x06, 0x00, 0x00]);
    client.write(message);

    // Wait for the server to send the server list response
    client.once('data', (data) => {
      console.log(`Received data from server: ${byteToNiceHex(data)}`);

      // Verify that the response is correct
      const expectedResponse = Buffer.from([0xC2, 0x00, 0x0B, 0xF4, 0x06, 0x00, 0x01, 0x00, 0x00, 0x14, 0xC1]);
      assert.deepStrictEqual(data, expectedResponse);

      done();
    });
  });

  it('should respond with server info when receiving the correct message for server with ID 0', done => {
    // Send the "server info" message to the server
    const message = Buffer.from([0xC1, 0x06, 0xF4, 0x03, 0x00, 0x00]);
    client.write(message);

    // Wait for the server to send the server info response
    client.once('data', (data) => {
      console.log(`Received data from server: ${byteToNiceHex(data)}`);

      // Verify that the response is correct
      const expectedResponse = Buffer.from([0xC1, 0x16, 0xF4, 0x03, 0x31, 0x32, 0x37, 0x2E, 0x30, 0x2E, 0x30, 0x2E, 0x31, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x5D, 0xDA]);
      assert.deepStrictEqual(data, expectedResponse);

      done();
    });
  });

});
