const {loadGameServersList, gameServersList} = require('../utils/loadGameServersList');
const {startServer, stopServer} = require('../utils/udp');
const assert = require('assert');
const mock = require('mock-fs');
const dgram = require("dgram");

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
    client = dgram.createSocket('udp4');
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
    // Send the "gameServerInfo" message to the server
    const message = Buffer.from([0xC1, 0x10, 0x01, 0xCC, 0x00, 0x00, 0x00, 0xCC, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xE8, 0x03]);
    // send the message to the server on port 55557
    client.send(message, 0, message.length, 55557, '127.0.0.1');
    setTimeout(() => {
      assert.strictEqual(gameServersList[0].state, 1);
      done();
    }, 15)
  });
});
