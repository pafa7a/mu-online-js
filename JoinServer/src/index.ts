import {startServer as initTCP} from './utils/tcp';
import ports from './config/ports.json';
import SocketClient from './utils/socketClient';

initTCP(ports.tcp);
new SocketClient('JoinServer');
