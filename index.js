const net = require('net');

const HOST = '127.0.0.1';
const PORT = 44405;

const client = new net.Socket();
client.connect(PORT, HOST, function() {
  // client.write(new Uint8Array([0xC1, 6, 0x02, 0x1, 0x1, 0x1]));
  // client.write(new Uint8Array([0xC1, 4, 0xF4, 0x06]));
  setTimeout(() => {

    client.write(new Uint8Array([0xC1, 4, 0xF4, 0x06]));
  }, 2000)

});

// Add a 'data' event handler for the client socket
// data is what the server sent to this socket
client.on('data', function(data) {
  console.log('received', Buffer.from( new Uint8Array(data) ));
});

// Add a 'close' event handler for the client socket
client.on('close', function() {
  console.log('Connection closed');
});
