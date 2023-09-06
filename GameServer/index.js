const {loadAllConfigs, getConfig} = require('./src/utils/config');
const {connectToJS, JSUserInfoSend} = require('./src/utils/joinserver');
const {CSInfoSend} = require('./src/utils/connectserver');
const {startTCPServer} = require('./src/utils/tcp');
loadAllConfigs();

connectToJS();

JSUserInfoSend();
CSInfoSend();

startTCPServer(getConfig('common').port);

setInterval(() => {
  JSUserInfoSend();
  CSInfoSend();
}, 5000);
