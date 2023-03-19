const {loadGameServersList, gameServersList} = require('../utils/loadGameServersList');
const {startServer, stopServer} = require('../utils/udp');
const assert = require('assert');
const mock = require('mock-fs');
const { createSocket } = require("dgram");
const packetManager = require('mu-packet-manager');
const structs = packetManager.getStructs();

let client;
describe('UDP Socket Server', () => {
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
            "show": true
          }
        ]
      )
    });
    loadGameServersList();
  });

  beforeEach(done => {
    // Start the UDP server on port 44405.
    startServer(55557);
    client = createSocket('udp4');
    done();
  });

  afterEach(() => {
    // Close the client connection.
    client.close();
    // Close the UDP server.
    stopServer();
  });

  after(() => {
    // Restore the original file system
    mock.restore();
  });

  it('should store the GameServer info in memory', done => {
    const messageStruct = {
      header: {
        type: 0xC1,
        size: 'auto',
        headCode: 0x01,
      },
      serverCode: 0,
      userTotal: 0,
      userCount: 0,
      accountCount: 0,
      pcPointCount: 0,
      maxUserCount: 1000,
    }
    const message = new packetManager()
      .useStruct(structs.CSGameServerInfo).toBuffer(messageStruct);
    // send the message to the server on port 55557
    client.send(message, 0, message.length, 55557, '127.0.0.1');
    setTimeout(() => {
      assert.strictEqual(gameServersList[0].state, 1);
      done();
    }, 15)
  });
});
