const readline = require('readline');
const {serverListResponse, tcpSockets, sendData} = require('./tcp');
const {loadGameServersList} = require('./loadGameServersList');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: '> '
});

// handle user input
rl.on('line', (line) => {
  if (line === 'reload') {
    loadGameServersList();
    // send a message to all connected clients
    tcpSockets.forEach((value, socket) => {
      serverListResponse(Buffer.alloc(0), socket, sendData);
    });
  }
  rl.prompt();
});

// handle Ctrl+C
rl.on('SIGINT', () => {
  rl.question('Are you sure you want to exit? ', (answer) => {
    if (answer.match(/^y(es)?$/i)) {
      // close the server and exit
      process.exit(0);
    } else {
      // resume readline prompt
      rl.prompt();
    }
  });
});

const init = () => {
  setTimeout(() => {
    rl.prompt();
  }, 150);
};

module.exports = init;
