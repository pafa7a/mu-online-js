import {startServer, stopServer} from '../utils/tcp';
import structs from './../utils/packets/index';
// @ts-expect-error Fix on a later stage
import PacketManager from '@mu-online-js/mu-packet-manager';
import {connect, Socket} from 'net';

describe('TCP Socket Server', () => {
  let client: Socket;

  before(() => {
  });

  beforeEach(done => {
    // Start the TCP server on port 55970.
    startServer(55970);

    // Connect to the server with a client socket
    client = connect({port: 55970}, () => {
      console.log('Client connected');
    });
    client.on('data', (data) => {
      const asd = '';
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
    const messageBuffer = new PacketManager()
      .useStruct(structs.GSJSServerInfoSend).toBuffer(messageStruct);
    client.write(messageBuffer);
    //@TODO: Check if the server info is stored correctly in memory.

    done();
  });

});
