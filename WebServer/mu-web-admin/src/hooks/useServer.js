import {useWebSocket} from '@/hooks/useWebSocket';
import config from '@/config';

export function useServer() {
  const {sendMessage} = useWebSocket();

  const startServer = serverName => {
    sendMessage('startServer', {
      serverName: serverName
    });
  };

  const stopServer = serverName => {
    sendMessage('stopServer', {
      serverName: serverName
    });
  };

  const startAllServers = () => {
    config.servers.forEach(server => {
      startServer(server.name);
    });
  };

  const stopAllServers = () => {
    config.servers.forEach(server => {
      stopServer(server.name);
    });
  };

  return {
    startServer,
    stopServer,
    startAllServers,
    stopAllServers
  };
}
