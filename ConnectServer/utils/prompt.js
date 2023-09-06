const readline = require('readline');
const {reloadGameServersList, loadGameServersList} = require('./loadGameServersList');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: '> '
});

// handle user input
rl.on('line', (line) => {
  if (line === 'reload') {
    loadGameServersList();
    reloadGameServersList();
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
