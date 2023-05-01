const WebSocket = require('ws');
const logger = require('./logger');
const fs = require('fs');

const handlers = {};
fs.readdirSync('./utils/handlers/ws')
  .filter((file) => file.endsWith('.js'))
  .forEach((file) => {
    handlers[file.replace('.js', '')] = require(`./handlers/ws/${file}`);
  });

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
        logger.error('Unable to send the message to the socket server');
      }
    };

    this.ws.on('message', message => {
      let data = {};
      try {
        data = JSON.parse(message);
      } catch (e) {
        logger.error('Invalid JSON data from the socket server.');
      }

      // Check if the event has a handler
      if (handlers[data.event]) {
        // Call the handler function with the client name, payload, and connected clients
        handlers[data.event](data.payload, this.sendToServer);
      }
    });
  }
}

module.exports = SocketClient;
