const {loadAllConfigs} = require('./src/utils/config');
const {connectToJS, JSUserInfoSend} = require('./src/utils/joinserver');
const {CSInfoSend} = require('./src/utils/connectserver');
loadAllConfigs();

connectToJS();

setInterval(() => {
  JSUserInfoSend();
  CSInfoSend();
}, 5000);
