import {loadGameServersList} from './utils/loadGameServersList';
import {startServer as initTCP} from './utils/tcp';
import {startServer as initUDP} from './utils/udp';
import ports from './config/ports.json';
import SocketClient from './utils/socketClient';

loadGameServersList();
initTCP(ports.tcp);
initUDP(ports.udp);
new SocketClient('ConnectServer');
