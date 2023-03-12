const net = require('net');
const {startServer, stopServer} = require('../utils/tcp');

describe('TCP Socket Server', () => {
  let client;

  before(() => {

  });

  beforeEach(done => {
    // Start the TCP server on port 55970.
    startServer(55970);

    // Connect to the server with a client socket
    client = net.connect({port: 55970}, () => {
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
    // Send the "server list" message to the server
    let buf = Buffer.alloc(58).fill(0xFE);
    buf.writeUInt8(0xC1, 0); //header type
    buf.writeUInt8(0x3A, 1); // header size
    buf.writeUInt8(0x00, 2); // header head code
    buf.writeUInt8(1, 3); // type
    buf.writeUIntLE(55901, 4, 2); // server port
    buf.write("MuEMU\x00", 6, 50) // server name followed by 0x00 that indicates end of the string.
    buf.writeUIntLE(0, 56, 2); // server code

    client.write(buf);
    //@TODO: Check if the server info is stored correctly in memory.
    done();
  });

});
