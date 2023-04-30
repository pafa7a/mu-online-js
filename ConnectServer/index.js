const {loadGameServersList} = require('./utils/loadGameServersList');
const initPrompt = require('./utils/prompt');
const {startServer: initTCP} = require('./utils/tcp');
const {startServer: initUDP} = require('./utils/udp');
const ports = require('./config/ports.json');
const SocketClient = require('./utils/socketClient');

loadGameServersList();
initTCP(ports.tcp);
initUDP(ports.udp);
initPrompt();
new SocketClient('ConnectServer');
