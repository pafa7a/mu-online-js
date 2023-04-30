const {startServer: initTCP} = require('./utils/tcp');
const ports = require('./config/ports.json');
const SocketClient = require('./utils/socketClient');

initTCP(ports.tcp);
new SocketClient('JoinServer');
