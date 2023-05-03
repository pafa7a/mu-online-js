import {useEffect, useCallback} from 'react';
import mitt from 'mitt';

let reconnectDelay = 500;
let ws = null;
const emitter = mitt();

export function useWebSocket() {

  const connect = useCallback(() => {
    ws = new WebSocket('ws://localhost:44404?x-client-name=mu-web-admin');

    ws.onopen = () => {
      console.log('WebSocket connected');
    };

    ws.onclose = () => {
      console.log(`WebSocket disconnected. Retrying after ${reconnectDelay}s`);
      setTimeout(() => {
        connect(true);
      }, reconnectDelay);
    };

    ws.onmessage = event => {
      const data = JSON.parse(event.data);
      emitter.emit(data.event, data.payload);
    };

  }, []);

  useEffect(() => {
    if (!ws) {
      connect();
    }
    return () => {
      ws.close();
    };
  }, [connect]);

  const sendMessage = (event, payload) => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      const message = JSON.stringify({event, payload});
      ws.send(message);
    } else {
      setTimeout(() => {
        sendMessage(event, payload);
      }, 500);
    }
  };

  return {sendMessage, emitter};
}
