const {WebSocketServer} = require('ws');
const fs = require('fs');

const server = new WebSocketServer({port: 44404});

const allowedIps = new Set([
  '127.0.0.1', '::ffff:127.0.0.1', 'localhost', '::ffff:172.18.0.1',
]);

const connectedClients = new Map();

const handlers = {};

// Load all handler files
fs.readdirSync('./handlers')
  .filter((file) => file.endsWith('.js'))
  .forEach((file) => {
    handlers[file.replace('.js', '')] = require(`./handlers/${file}`);
  });

/**
 * Helper function to send message to client/s.
 *
 * @param {String} clientName
 * @param {Object} payload
 */
const sendToClient = (clientName, payload) => {
  try {
    if (clientName === 'all') {
      for (let name of connectedClients.keys()) {
        sendToClient(name, payload);
      }
      return;
    }
    const clientSocket = connectedClients.get(clientName);
    clientSocket.send(JSON.stringify(payload));
  } catch (e) {
    console.log(`Unable to send the message to client "${clientName}"`);
  }
};

server.on('connection', (socket, request) => {
  const ip = request.socket.remoteAddress;
  if (!allowedIps.has(ip)) {
    console.log(`Connection rejected from ${ip}`);
    socket.close();
    return;
  }

  const clientName = request.headers['x-client-name'];
  if (!clientName || connectedClients.has(clientName)) {
    console.log(`Connection rejected from ${ip} - invalid or duplicate client name`);
    socket.close();
    return;
  }

  console.log(`Connection accepted from ${ip} for client "${clientName}"`);
  connectedClients.set(clientName, socket);

  socket.on('message', (message) => {
    let data = {};
    try {
      data = JSON.parse(message);
    } catch (e) {
      console.log('Invalid JSON data');
    }

    // Check if the event has a handler
    if (handlers[data.event]) {
      // Call the handler function with the client name, payload, and connected clients
      handlers[data.event](clientName, data.payload, sendToClient);
    } else {
      console.log(`Invalid or missing handler: "${data.event}" sent by client: "${clientName}"`);
    }
  });

  socket.on('close', () => {
    console.log(`Connection closed from ${ip} for client "${clientName}"`);
    connectedClients.delete(clientName);
  });
});
