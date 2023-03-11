const dgram = require('dgram');

const init = port => {
  const udpServer = dgram.createSocket('udp4');
  udpServer.on('message', (data) => {
    onUDPReceive(data);
  });

  udpServer.bind(port, () => {
    console.log('UDP server listening on port 55557');
  });
}

const onUDPReceive = data => {
  if (data[1] === 0x10) {
    const serverInfo = {
      serverCode: data.readUintLE(4, 1),
      userTotal: data.readUintLE(6, 1),
      userCount: data.readUintLE(8, 2),
      accountCount: data.readUintLE(10, 2),
      pcPointCount: data.readUintLE(12, 2),
      maxUserCount: data.readUintLE(14, 2),
    }
    console.log(serverInfo)
  }
}

module.exports = init;
