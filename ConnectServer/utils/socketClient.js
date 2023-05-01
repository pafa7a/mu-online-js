const WebSocket = require('ws');
const logger = require('./logger');
const fs = require('fs');
const {EOL} = require('os');

const handlers = {};
fs.readdirSync('./utils/handlers/ws')
  .filter((file) => file.endsWith('.js'))
  .forEach((file) => {
    handlers[file.replace('.js', '')] = require(`./handlers/ws/${file}`);
  });

let sendToServer = () => {};

class SocketClient {
  constructor(clientName) {
    this.clientName = clientName;
    this.ws = null;
    this.connect();
  }

  connect() {
    this.ws = new WebSocket('ws://localhost:44404', {
      headers: {
        'x-client-name': this.clientName
      }
    });

    this.ws.on('open', () => {
      logger.info('Successfully connected to the Socket server');
    });

    this.ws.on('error', (error) => {
      if (!error?.message.includes('connect ECONNREFUSED')) {
        logger.error(`Socket server error: ${error.message}`);
      }
    });

    this.ws.on('close', () => {
      logger.warning('Cannot connect to the socket server. Retrying after 5s.');
      setTimeout(() => this.connect(), 5000);
    });

    this.sendToServer = payload => {
      try {
        this.ws.send(JSON.stringify(payload));
      } catch (e) {
        if (this.ws && this.ws.readyState !== this.ws.OPEN) {
          logger.error('The socket connection is not yet open. Retrying after 1s');
          setTimeout(() => {
            this.sendToServer(payload);
          }, 1000);
        }
        else {
          logger.error('Unable to send the message to the socket server.');
        }
      }
    };

    sendToServer = this.sendToServer;

    this.ws.on('message', message => {
      handleMessage(message);
    });

  }
}

const handleMessage = message => {
  let data = {};
  try {
    data = JSON.parse(message);
  } catch (e) {
    logger.error('Invalid JSON data from the socket server.');
  }

  // Check if the event has a handler
  if (handlers[data.event]) {
    // Call the handler function with the client name, payload, and connected clients
    handlers[data.event](data.payload, sendToServer);
  }
};
process.stdin.on('data', data => {
  data = data.toString().split(EOL);
  // Remove the last new line.
  data.pop();
  for (const message of data) {
    handleMessage(message);
  }

  // Keep listening for more inputs.
  process.stdin.resume();
});

module.exports = SocketClient;
