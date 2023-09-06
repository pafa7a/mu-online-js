const {loadAllConfigs, getConfig} = require('./src/utils/config');
const {connectToJS, JSUserInfoSend} = require('./src/utils/joinserver');
const {CSInfoSend} = require('./src/utils/connectserver');
const {startTCPServer} = require('./src/utils/tcp');
const loadClientVersionAndSerial = require('./src/utils/loadClientVersionAndSerial');

// Internal.
loadAllConfigs();
loadClientVersionAndSerial();

// JoinServer TCP.
connectToJS();

// Send info to JS via TCP and CS via UDP.
JSUserInfoSend();
CSInfoSend();

// Start the TCP server.
const {port} = getConfig('common');
startTCPServer(port);

// Periodically send info to CS and JS.
setInterval(() => {
  JSUserInfoSend();
  CSInfoSend();
}, 5000);
