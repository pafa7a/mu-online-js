const {loadGameServersList} = require('./utils/loadGameServersList');
const initPrompt = require('./utils/prompt');
const {startServer: initTCP} = require('./utils/tcp');
const initUDP = require('./utils/udp');
const ports = require('./config/ports.json');

loadGameServersList();
initTCP(ports.tcp);
initUDP(ports.udp);
initPrompt();
