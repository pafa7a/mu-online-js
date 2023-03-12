const {startServer: initTCP} = require('./utils/tcp');
const ports = require('./config/ports.json');

initTCP(ports.tcp);
