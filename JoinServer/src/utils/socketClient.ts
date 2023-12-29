import WebSocket, {RawData} from 'ws';
import logger from './logger';
import fs from 'fs';
import { EOL } from 'os';
import { stdin } from 'node:process';
import path from 'path';

interface Handlers {
  [key: string]: (payload: object, sendToServer: () => void) => void;
}

interface SocketData {
  event: string;
  payload: object;
}

const handlers: Handlers = {};

const tsNodeSymbol = Symbol.for('ts-node.register.instance');
const scriptExtensions = Reflect.has(process, tsNodeSymbol) ? '.ts' : '.js';

fs.readdirSync(path.join(__dirname, 'handlers/ws'))
  .filter((file) => file.endsWith(scriptExtensions))
  .forEach((file) => {
    handlers[file.replace(scriptExtensions, '')] = require(`./handlers/ws/${file}`);
  });

let sendToServer: (payload: void) => void = () => {};

class SocketClient {
  private ws: null | WebSocket;
  private readonly clientName: string;

  constructor(clientName: string) {
    this.clientName = clientName;
    this.ws = null;
    this.connect();
  }

  connect() {
    this.ws = new WebSocket('ws://localhost:44404', {
      headers: {
        'x-client-name': this.clientName,
      },
    });

    this.ws.on('open', () => {
      logger.info('Successfully connected to the Socket server');
    });

    this.ws.on('error', (error: Error) => {
      if (!error?.message.includes('connect ECONNREFUSED')) {
        logger.error(`Socket server error: ${error.message}`);
      }
    });

    this.ws.on('close', () => {
      setTimeout(() => this.connect(), 5000);
    });

    sendToServer = (payload: void) => {
      try {
        if (this.ws) {
          this.ws.send(JSON.stringify(payload));
        }
      } catch (e) {
        if (this.ws && this.ws.readyState !== this.ws.OPEN) {
          logger.error('The socket connection is not yet open. Retrying after 1s');
          setTimeout(() => {
            sendToServer(payload);
          }, 1000);
        } else {
          logger.error('Unable to send the message to the socket server.');
        }
      }
    };

    this.ws.on('message', (message: RawData) => {
      handleMessage(message);
    });
  }
}

const handleMessage = (message: RawData|string) => {
  let data: SocketData = { event: '', payload: {} };
  try {
    if (typeof message === 'string') {
      data = JSON.parse(message);
    }
  } catch (e) {
    logger.error('Invalid JSON data from the socket server.');
  }

  if (handlers[data.event]) {
    handlers[data.event](data.payload, sendToServer);
  }
};

stdin.on('data', (data) => {
  const dataString = data.toString().split(EOL);
  dataString.pop();
  for (const message of dataString) {
    handleMessage(message);
  }

  stdin.resume();
});

export = SocketClient;
