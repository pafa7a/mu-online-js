const { connect } = require('net');
const {startServer, stopServer} = require('../utils/tcp');
const packetManager = require('@mu-online-js/mu-packet-manager');
const structs = packetManager.getStructs();
const assert = require("assert");

describe('TCP Socket Server', () => {
  let client;

  before(() => {

  });

  beforeEach(done => {
    // Start the TCP server on port 55970.
    startServer(55970);

    // Connect to the server with a client socket
    client = connect({port: 55970}, () => {
      console.log('Client connected');
    });
    done();
  });

  afterEach(() => {
    // Close the client socket
    client.destroy();

    // Close the TCP server.
    stopServer();
  });

  after(() => {
  });

  it('should add the gameserver to the global GS list when receiving the serverInfoSend request', done => {
    const messageStruct = {
      header: {
        type: 0xC1,
        size: 'auto',
        headCode: 0x00,
      },
      serverType: 1,
      serverPort: 55901,
      serverName: 'MuEMU',
      serverCode: 0
    };
    const messageBuffer = new packetManager()
      .useStruct(structs.GSJSServerInfoSend).toBuffer(messageStruct);
    client.write(messageBuffer);
    //@TODO: Check if the server info is stored correctly in memory.

    done();
  });

  it('should return invalid login attempt', done => {
    const messageStruct = {
      header: {
        type: 0xC1,
        size: 'auto',
        headCode: 0x01,
      },
      playerIndex: 9000,
      account: 'pafa7a',
      password: '1234test',
      ipAddress: '127.0.0.1',
    };
    const messageBuffer = new packetManager()
      .useStruct(structs.GSJSConnectAccountSend).toBuffer(messageStruct);
    client.write(messageBuffer);

    // Wait for the server to send the login response
    client.once('data', (data) => {

      const responseStruct = {
        header: {
          type: 0xC1,
          size: 'auto',
          headCode: 0x01,
        },
        playerIndex: 9000,
        account: 'pafa7a',
        personalCode: '1234',
        result: 0,
        blockCode: 0,
        accountLevel: 0,
        accountExpireDate: 'someexpire',
        lock: 0,
      }
      const expectedResponseBuffer = new packetManager()
        .useStruct(structs.JSGSConnectAccountSend).toBuffer(responseStruct);

      // Verify that the response is correct.
      assert.deepStrictEqual(data, expectedResponseBuffer);

      done();
    });
  });

});
