import {createServer, Server} from 'tls';
import fs from 'fs';
import byteToNiceHex from './byteToNiceHex';
// @ts-expect-error Fix on a later stage
import PacketManager from '@mu-online-js/mu-packet-manager';
import structs from './packets/index';
import serverInfoResponse from './handlers/serverInfoResponse';
import serverListResponse from './handlers/serverListResponse';
import logger from './logger';
import {env} from 'node:process';
import {PacketHandlersTcp, SendData} from './types';

const serverOptions = {
  key: fs.readFileSync('./../ssl/key.pem'),
  cert: fs.readFileSync('./../ssl/cert.pem'),
  rejectUnauthorized: true,
  requestCert: false,
  ca: [fs.readFileSync('./../ssl/cert.pem')],
};

let tcpServer: Server;
const tcpSockets = new Map();

const startServer = (port: number) => {
  tcpServer = createServer(serverOptions, (socket) => {
    // Store the socket in map.
    tcpSockets.set(socket, true);

    if (env.DEBUG) {
      logger.info(`New client connected. IP: ${socket.remoteAddress}`);
    }

    // Send the init packet to Main.
    const messageStruct = {
      header: {
        type: 0xC1,
        size: 'auto',
        subCode: 0x00,
      },
      result: 1,
    };
    const initMessageBuffer = new PacketManager()
      .useStruct(structs.CSMainSendInitPacket).toBuffer(messageStruct);
    sendData({socket, data: initMessageBuffer, description: 'CSMainSendInitPacket'});

    socket.on('data', (data) => {
      const packetType = data[0];
      let packetHead = data[2];
      let packetSub = data[3];

      if (packetType === 0xC2) {
        packetHead = data[3];
        packetSub = data[4];
      }

      const packetHandlers: PacketHandlersTcp = {
        0xC1: {
          0xF4: {
            0x03: serverInfoResponse,
            0x06: serverListResponse,
          },
        },
      };

      const handler = packetHandlers[packetType]?.[packetHead]?.[packetSub];
      onReceive({data, handler});
      if (handler) {
        handler({data, socket, sendData});
      }
    });

    socket.on('end', () => {
      // Remove the socket from the map.
      tcpSockets.delete(socket);
      logger.info('Client disconnected');
    });

    socket.on('error', (error) => {
      // Remove the socket from the map.
      tcpSockets.delete(socket);
      if (error?.code !== 'ECONNRESET') {
        logger.info(`Socket Error: ${error.message}`);
      }
    });

  });
  tcpServer.on('error', (error) => {
    logger.info(`Server Error: ${error.message}`);
  });

  tcpServer.listen(port, () => {
    logger.info(`TCP socket server is running on port: ${port}`);
  });
};

/**
 * Helper function that logs the bytes in HEX format upon sending data.
 */
const sendData = ({socket, data, description = ''}: SendData) => {
  const buffer = Buffer.from(data);
  socket.write(buffer);
  if (env.DEBUG) {
    logger.info(`Sent [${description}]: ${byteToNiceHex(data)}`);
  }
};

/**
 * Helper function that logs the bytes in HEX format upon receive.
 */
const onReceive = ({data, handler}: {data: Buffer, handler: object|string}) => {
  const hexString = byteToNiceHex(data);
  let handlerName = 'Unknown';
  if (typeof handler === 'function') {
    handlerName = handler.name;
  }

  if (env.DEBUG) {
    logger.info(`Received [${handlerName}]: ${hexString}`);
  }
};

const stopServer = () => {
  tcpServer.close();
};

export {
  startServer,
  tcpSockets,
  serverListResponse,
  stopServer,
  sendData,
  onReceive
};
