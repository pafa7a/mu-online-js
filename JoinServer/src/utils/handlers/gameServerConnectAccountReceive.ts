// @ts-expect-error Fix on a later stage
import PacketManager from '@mu-online-js/mu-packet-manager';
import structs from './../packets';
import loginMessage from './../enums/loginMessage';
// @ts-expect-error Fix on a later stage
import db from '@mu-online-js/mu-db';
import logger from '../logger';
import { Socket } from 'net';

interface GameServerConnectAccountReceiveParams {
  data: Buffer;
  socket: Socket;
  sendData: ({ socket, data, description, rawData }: { socket: Socket, data: Buffer, description: string, rawData: object }) => void;
}

/**
 * Handles GameServerConnectAccountReceive request coming from GS.
 */
const gameServerConnectAccountReceive = async ({ data, socket, sendData }: GameServerConnectAccountReceiveParams) => {
  const accountInfo = new PacketManager().fromBuffer(data)
    .useStruct(structs.GSJSConnectAccountSend).toObject();
  logger.info(accountInfo);

  /**
   * Results of a database query to retrieve account information.
   */
  interface DbMembInfoResponseItem {
    memb_guid: number;
    memb___id: string;
    memb__pwd: string;
    sno__numb: string;
    bloc_code: number;
  }

  type DbMembInfoResponse = DbMembInfoResponseItem[];

  /**
   * The result of the database query to retrieve account information.
   */
  const dbResult: DbMembInfoResponse = await db('SELECT memb__pwd, sno__numb FROM memb_info WHERE memb___id = ?', [
    accountInfo.account
  ]);

  const responseStruct = {
    header: {
      type: 0xC1,
      size: 'auto',
      headCode: 0x01,
    },
    playerIndex: accountInfo.index,
    account: accountInfo.account,
    personalCode: '',
    result: loginMessage.LOG_IN_FAIL_ID,
    blockCode: 0,
    accountLevel: 0,
    accountExpireDate: '',
    lock: 0,
  };

  if (dbResult.length) {
    const [dbAccount] = dbResult;
    //@TODO: create db table with IP blacklist and check if the IP is there.
    // Validate password.
    if (dbAccount.memb__pwd !== accountInfo.password) {
      responseStruct.result = loginMessage.LOG_IN_FAIL_PASSWORD;
    }
    // Validate blocked.
    else if (dbAccount.bloc_code === 1) {
      responseStruct.result = loginMessage.LOG_IN_FAIL_ID_BLOCK;
    }
    // Successful login.
    else {
      responseStruct.result = loginMessage.LOG_IN_SUCCESS;
      responseStruct.personalCode = dbAccount.sno__numb;
    }
  }

  const responseBuffer = new PacketManager()
    .useStruct(structs.JSGSConnectAccountSend).toBuffer(responseStruct);
  sendData({ socket, data: responseBuffer, description: 'send login result', rawData: responseStruct });
};

export = gameServerConnectAccountReceive;
