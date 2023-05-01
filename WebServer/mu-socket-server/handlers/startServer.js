const {spawn} = require('child_process');
const path = require('path');

/**
 * Pass the process info from the server to mu-web-admin.
 *
 * @param {String} clientName
 * @param {Object} payload
 * @param {Function} sendToClient
 * @param {Object} globalStore
 */
module.exports = ({payload, sendToClient, globalStore}) => {
  const serverName = payload.serverName;
  let serverPath;
  switch (serverName) {
  case 'ConnectServer':
    serverPath = path.join(process.cwd(), '../../ConnectServer/');
    break;
  case 'JoinServer':
    serverPath = path.join(process.cwd(), '../../JoinServer/');
    break;
  }

  if (!serverPath) {
    return;
  }

  if (globalStore?.childProcesses[serverName]) {
    return;
  }

  const child = spawn('node', ['index.js'], {
    cwd: serverPath
  });

  globalStore.childProcesses[serverName] = child;

  child.stdout.on('data', (data) => {
    data = data.toString();
    const response = {
      event: 'logFromChildProcess',
      payload: {
        serverName,
        type: 'info',
        data
      }
    };
    sendToClient('mu-web-admin', response);
  });

  child.stderr.on('data', (data) => {
    data = data.toString();
    const response = {
      event: 'logFromChildProcess',
      payload: {
        serverName,
        type: 'error',
        data
      }
    };
    sendToClient('mu-web-admin', response);
  });

  child.on('close', (code) => {
    delete globalStore.childProcesses[serverName];
    const response = {
      event: 'serverStopped',
      payload: {
        serverName,
        code
      }
    };
    sendToClient('mu-web-admin', response);
  });

  const response = {
    event: 'serverStarted',
    payload: {
      serverName
    }
  };
  sendToClient('mu-web-admin', response);
};
