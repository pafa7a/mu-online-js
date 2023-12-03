const {createServer} = require('tls');
const byteToNiceHex = require('./byteToNiceHex');
const packetManager = require('@mu-online-js/mu-packet-manager');
const structs = require('./../packets/gameserver');
const globalState = require('./state');
const loginMessage = require('./../enums/loginMessage');
const characterClasses = require('./../enums/characterClasses');
const characterClassesProtocol = require('./../enums/characterClassesProtocol');
const {JSAccountLoginSend} = require('./joinserver');
const sendDataToClient = require('./sendDataToClient');
const disconnectPlayer = require('./disconnectPlayer');
const fs = require('fs');
const db = require('@mu-online-js/mu-db');
const {getConfig} = require('./config');

const serverOptions = {
  key: fs.readFileSync('./../ssl/key.pem'),
  cert: fs.readFileSync('./../ssl/cert.pem'),
  rejectUnauthorized: true,
  requestCert: false,
  ca: [fs.readFileSync('./../ssl/cert.pem')],
};
let tcpServer;
const {tcpSockets} = globalState;

/**
 * @typedef {import('net').Socket} Socket
 */
const startTCPServer = port => {
  tcpServer = createServer(serverOptions, (socket) => {
    console.log(`[GameServer] New client connection from IP ${socket.remoteAddress}`);

    NewClientConnected(socket);

    // Store the socket in map.
    tcpSockets.set(socket.remotePort, socket);

    socket.on('data', buffer => {
      let handler;
      const packetType = buffer[0];
      let packetHead = buffer[2];
      let packetSub = buffer[3];

      if (packetType === 0xC2) {
        packetHead = buffer[3];
        packetSub = buffer[4];
      }

      const packetHandlers = {
        0xC1: {
          0xF3: {
            0x00: MainCharactersListRequest,
            0x01: MainCreateNewCharacterRequest,
          }
        },
        0xC3: {
          0xF1: {
            0x01: MainLoginRequest,
          },
          0x0E: MainHackCheckRequest,
        },
      };
      handler = packetHandlers[packetType]?.[packetHead]?.[packetSub];
      if (typeof packetHandlers[packetType]?.[packetHead] === 'function') {
        handler = packetHandlers[packetType]?.[packetHead];
      }
      onReceive({buffer, handler});
      if (handler) {
        handler({buffer, socket});
      }
    });

    socket.on('end', () => {
      disconnectPlayer(socket.remotePort);

      console.log(`[GameServer] Client disconnect for IP ${socket.remoteAddress}`);
    });

    socket.on('error', (error) => {
      // Remove the socket from the map.
      tcpSockets.delete(socket.remotePort);
      if (error?.code !== 'ECONNRESET') {
        console.log(`[GameServer] Socket Error: ${error.message}`);
      }
    });

  });
  tcpServer.on('error', (error) => {
    console.log(`[GameServer] Server Error: ${error.message}`);
  });

  tcpServer.listen(port, () => {
    console.log(`[GameServer] TCP socket server is running on port: ${port}`);
  });
};

/**
 * Helper function that logs the bytes in HEX format upon receive.
 * @param {Object} buffer
 * @param {Function | String} handler
 * @constructor
 */
const onReceive = ({buffer, handler}) => {
  const hexString = byteToNiceHex(buffer);
  let handlerName = 'Unknown';
  if (typeof handler === 'function') {
    handlerName = handler.name;
  }

  if (process.env.DEBUG) {
    console.log(`[GameServer] Received [${handlerName}]: ${hexString}`);
  }
};

const stopTCPServer = () => {
  tcpServer.close();
};

const MainLoginRequest = ({buffer, socket}) => {
  const userId = socket.remotePort;
  const userIP = socket.remoteAddress;
  const data = new packetManager().fromBuffer(buffer).useStruct(structs.RequestLogin).toObject();
  const {username, password, version, serial} = data;
  let loginAttempts = 1;
  const messageStruct = {
    header: {
      type: 0xC1,
      size: 'auto',
      headCode: 0xF1,
      subCode: 0x01,
    },
    result: loginMessage.LOG_IN_FAIL_WRONG_PASSWORD
  };

  // Validate the provided version and serial.
  if (version !== globalState.version || serial !== globalState.serial) {
    messageStruct.result = loginMessage.LOG_IN_FAIL_WRONG_PASSWORD;
    const message = new packetManager().useStruct(structs.LoginResult).toBuffer(messageStruct);
    sendDataToClient({
      socket,
      data: message,
      description: 'LoginResult',
      rawData: messageStruct
    });
    return;
  }

  // Check if already exists in the global state.
  if (globalState?.users.has(userId)) {
    const user = globalState.users.get(userId);
    loginAttempts = user.loginAttempts + 1;
    user.loginAttempts = loginAttempts;

    // Validate the number of login attempts.
    if (user.loginAttempts > 3) {
      messageStruct.result = loginMessage.LOG_IN_FAIL_EXCEED_MAX_ATTEMPTS;
      const message = new packetManager().useStruct(structs.LoginResult).toBuffer(messageStruct);
      sendDataToClient({
        socket,
        data: message,
        description: 'LoginResult',
        rawData: messageStruct
      });
      disconnectPlayer(userId);
      return;
    }

    if (user.connected) {
      messageStruct.result = loginMessage.LOG_IN_FAIL_ALREADY_CONNECTED;
      const message = new packetManager().useStruct(structs.LoginResult).toBuffer(messageStruct);
      sendDataToClient({
        socket,
        data: message,
        description: 'LoginResult',
        rawData: messageStruct
      });
      return;
    }
  }
  globalState.users.set(userId, {
    socketId: userId,
    IP: userIP,
    loginAttempts: loginAttempts,
    mapServerMoveRequest: false,
    lastServerCode: -1,
    destMap: -1,
    destX: 0,
    destY: 0,
    connected: false,
    username,
  });

  // Send the credentials to JS for validation.
  JSAccountLoginSend({userId, account: username, password, ipAddress: userIP});
};

const NewClientConnected = socket => {
  // Send the init packet to Main.
  const messageStruct = {
    header: {
      type: 0xC1,
      size: 'auto',
      headCode: 0xF1,
      subCode: 0x00,
    },
    result: 1,
    playerIndexH: (socket.remotePort >> 8) & 0xFF,
    playerIndexL: socket.remotePort & 0xFF,
    version: globalState.version
  };
  const initMessageBuffer = new packetManager()
    .useStruct(structs.NewClientConnected).toBuffer(messageStruct);
  sendDataToClient({
    socket,
    data: initMessageBuffer,
    description: 'NewClientConnected',
    rawData: messageStruct
  });
};

const MainHackCheckRequest = () => {
  // Potentially can skip this.
};

const MainCharactersListRequest = async ({socket}) => {
  const userId = socket.remotePort;

  if (!globalState?.users.has(userId)) {
    return;
  }

  const user = globalState.users.get(userId);
  const {username} = user;
  /**
   * Results of a database query to retrieve account characters information.
   * @typedef {Object} DbAccountCharacterInfoResponseItem
   * @property {string} username
   * @property {string|null} character1
   * @property {string|null} character2
   * @property {string|null} character3
   * @property {string|null} character4
   * @property {string|null} character5
   *
   * @typedef {DbAccountCharacterInfoResponseItem[]} DbAccountCharacterResponse
   */

  /**
   * The result of the database query to retrieve account information.
   * @type {DbAccountCharacterResponse}
   */
  let dbAccountCharacterResult = await db('SELECT * FROM AccountCharacter WHERE username = ?', [
    username
  ]);
  let dbCharacterResult = await db('SELECT * FROM `Character` WHERE username = ?', [
    username
  ]);

  // If there is no such data - create it on the fly and retrieve it.
  if (!dbAccountCharacterResult?.length) {
    const insertInAccountCharacterQuery = 'INSERT INTO AccountCharacter (username) VALUES ?';
    await db(insertInAccountCharacterQuery, [username]);
    dbAccountCharacterResult = await db('SELECT * FROM AccountCharacter WHERE username = ?', [
      username
    ]);
  }

  const {
    character1,
    character2,
    character3,
    character4,
    character5
  } = dbAccountCharacterResult[0];
  const characters = [character1, character2, character3, character4, character5];

  const messageStruct = {
    header: {
      type: 0xC1,
      size: 'auto',
      headCode: 0xF3,
      subCode: 0x00,
    },
    maxClass: 0,
    moveCount: 0,
    characterCount: 0,
    isVaultExtended: 0,
    characterList: [],
  };
  for (let i = 0; i < characters.length; i++) {
    if (!characters[i]) {
      continue;
    }
    const currentCharacter = dbCharacterResult.find(res => res.name === characters[i]);
    if (!currentCharacter) {
      continue;
    }
    const TempInventory = new Array(12);
    const charSet = new Array(17);

    let inventoryHex = 'F'.repeat(3456); // Empty inventory by default.

    // Use inventory from DB if exists.
    if (currentCharacter['inventory']) {
      inventoryHex = currentCharacter['inventory'];
    }

    const hexString = `0x${inventoryHex}`;
    const dbInventoryParsed = hexString.slice(2).match(/.{2}/g).map(hex => parseInt(hex, 16));

    const numRows = 12;
    const numCols = 16;
    const playerInventory = [];
    const inventoryGrouped = Array.from({length: numRows}, (_, i) =>
      dbInventoryParsed.slice(i * numCols, (i + 1) * numCols)
    );

    for (let i = 0; i < numRows; i++) {
      if (inventoryGrouped[i][0] === 0xFF && (inventoryGrouped[i][7] & 0x80) === 0x80 && (inventoryGrouped[i][9] & 0xF0) === 0xF0) {
        playerInventory[(i * 5)] = 0xFF;
        playerInventory[1 + (i * 5)] = 0xFF;
        playerInventory[2 + (i * 5)] = 0xFF;
        playerInventory[3 + (i * 5)] = 0xFF;
        playerInventory[4 + (i * 5)] = 0xFF;
      } else {
        playerInventory[(i * 5)] = inventoryGrouped[i][0];
        playerInventory[1 + (i * 5)] = inventoryGrouped[i][1];
        playerInventory[2 + (i * 5)] = inventoryGrouped[i][7];
        playerInventory[3 + (i * 5)] = inventoryGrouped[i][8];
        playerInventory[4 + (i * 5)] = inventoryGrouped[i][9];
      }
    }

    const MAX_ITEM_TYPE = 512;

    charSet[0] = characterClassesProtocol[currentCharacter['class']];

    for (let i = 0; i < 9; i++) {
      if (i === 0 || i === 1) {
        if (playerInventory[i * 5] === 0xFF && (playerInventory[2 + i * 5] & 0x80) === 0x80 && (playerInventory[4 + i * 5] & 0xF0) === 0xF0) {
          TempInventory[i] = 0xFFFF;
        } else {
          TempInventory[i] = playerInventory[i * 5] + (playerInventory[2 + i * 5] & 0x80) * 2 + (playerInventory[4 + i * 5] & 0xF0) * 32;
        }
      } else {
        if (playerInventory[i * 5] === 0xFF && (playerInventory[2 + i * 5] & 0x80) === 0x80 && (playerInventory[4 + i * 5] & 0xF0) === 0xF0) {
          TempInventory[i] = 0x1FF;
        } else {
          TempInventory[i] = (playerInventory[i * 5] + (playerInventory[2 + i * 5] & 0x80) * 2 + (playerInventory[4 + i * 5] & 0xF0) * 32) % MAX_ITEM_TYPE;
        }
      }
    }

    charSet[1] = TempInventory[0] % 256;
    charSet[12] |= (TempInventory[0] / 16) & 0xF0;

    charSet[2] = TempInventory[1] % 256;
    charSet[13] |= (TempInventory[1] / 16) & 0xF0;

    charSet[3] |= (TempInventory[2] & 0x0F) << 4;
    charSet[9] |= (TempInventory[2] & 0x10) << 3;
    charSet[13] |= (TempInventory[2] & 0x1E0) >> 5;

    charSet[3] |= (TempInventory[3] & 0x0F);
    charSet[9] |= (TempInventory[3] & 0x10) << 2;
    charSet[14] |= (TempInventory[3] & 0x1E0) >> 1;

    charSet[4] |= (TempInventory[4] & 0x0F) << 4;
    charSet[9] |= (TempInventory[4] & 0x10) << 1;
    charSet[14] |= (TempInventory[4] & 0x1E0) >> 5;

    charSet[4] |= (TempInventory[5] & 0x0F);
    charSet[9] |= (TempInventory[5] & 0x10);
    charSet[15] |= (TempInventory[5] & 0x1E0) >> 1;

    charSet[5] |= (TempInventory[6] & 0x0F) << 4;
    charSet[9] |= (TempInventory[6] & 0x10) >> 1;
    charSet[15] |= (TempInventory[6] & 0x1E0) >> 5;

    let level = 0;

    const table = [1, 0, 6, 5, 4, 3, 2];

    for (let i = 0; i < 7; i++) {
      if (TempInventory[i] !== 0x1FF && TempInventory[i] !== 0xFFFF) {
        level |= ((((playerInventory[1 + i * 5] / 8) & 0x0F) - 1) / 2) << (i * 3);
        charSet[10] |= (((playerInventory[1 + i * 5] / 1) & 0x3F) ? 2 : 0) << table[i];
        charSet[11] |= (((playerInventory[3 + i * 5] / 1) & 0x03) ? 2 : 0) << table[i];
      }
    }

    charSet[6] = level >> 16;
    charSet[7] = level >> 8;
    charSet[8] = level;

    if (TempInventory[7] === 0x1FF) {
      charSet[5] |= 12;
    } else if (TempInventory[7] >= 0 && TempInventory[7] <= 2) {
      charSet[5] |= TempInventory[7] << 2;
    } else if (TempInventory[7] >= 3 && TempInventory[7] <= 6) {
      charSet[5] |= 12;
      charSet[9] |= TempInventory[7] - 2;
    } else if (TempInventory[7] === 30) {
      charSet[5] |= 12;
      charSet[9] |= 5;
    } else if (TempInventory[7] >= 36 && TempInventory[7] <= 40) {
      charSet[5] |= 12;
      charSet[16] |= (TempInventory[7] - 35) << 2;
    } else if (TempInventory[7] === 41) {
      charSet[5] |= 12;
      charSet[9] |= 6;
    } else if (TempInventory[7] === 42) {
      charSet[5] |= 12;
      charSet[16] |= 28;
    } else if (TempInventory[7] === 43) {
      charSet[5] |= 12;
      charSet[16] |= 24;
    } else if (TempInventory[7] >= 130 && TempInventory[7] <= 135) {
      charSet[5] |= 12;
      charSet[17] |= (TempInventory[7] - 129) << 5;
    }
    // else if(gCustomWing.CheckCustomWingByItem(GET_ITEM(12,TempInventory[7])) != 0) {
    //   charSet[5] |= 12;
    //   charSet[17] |= (gCustomWing.GetCustomWingIndex(GET_ITEM(12,TempInventory[7]))+1) << 1;
    // }

    if (TempInventory[8] === 0x1FF) {
      charSet[5] |= 3;
    } else if (TempInventory[8] >= 0 && TempInventory[8] <= 2) {
      charSet[5] |= TempInventory[8];
    } else if (TempInventory[8] === 3) {
      charSet[5] |= 3;
      charSet[10] |= 1;
    } else if (TempInventory[8] === 4) {
      charSet[5] |= 3;
      charSet[12] |= 1;
    } else if (TempInventory[8] === 37) {
      charSet[5] |= 3;
      charSet[10] &= 0xFE;
      charSet[12] &= 0xFE;
      charSet[12] |= 4;

      if ((playerInventory[42] & 1) !== 0) {
        charSet[16] |= 1;
      } else if ((playerInventory[42] & 2) !== 0) {
        charSet[16] |= 2;
      } else if ((playerInventory[42] & 4) !== 0) {
        charSet[17] |= 1;
      }
    } else if (TempInventory[8] === 64 || TempInventory[8] === 65 || TempInventory[8] === 67) {
      charSet[16] |= (TempInventory[8] - 63) << 5;
    } else if (TempInventory[8] === 80) {
      charSet[16] |= 0xE0;
    } else if (TempInventory[8] === 106) {
      charSet[16] |= 0xA0;
    } else if (TempInventory[8] === 123) {
      charSet[16] |= 0x60;
    }

    messageStruct.characterList.push({
      slot: i,
      name: currentCharacter.name,
      level: currentCharacter.level,
      ctlCode: currentCharacter.ctlCode,
      charSet: charSet,
      guildStatus: 0xFF, //@TODO: Get the guild status from db.
    });
  }

  // First send the info about which character types are unlocked for creation.
  const messageUnlockStruct = {
    header: {
      type: 0xC1,
      size: 'auto',
      headCode: 0xDE,
      subCode: 0x00,
    },
    flags: 15, // @TODO: This allows all type of characters to be created. Make it configurable based on character level or character card.
  };
  user.classFlags = 15;
  const messageUnlock = new packetManager().useStruct(structs.CharacterClassCreationUnlock).toBuffer(messageUnlockStruct);
  sendDataToClient({
    socket,
    data: messageUnlock,
    description: 'CharactersUnlockInfo',
    rawData: messageUnlockStruct
  });

  // Then send the characters info.
  messageStruct.characterCount = messageStruct.characterList.length;
  const message = new packetManager().useStruct(structs.CharacterList).toBuffer(messageStruct);
  sendDataToClient({
    socket,
    data: message,
    description: 'CharactersList',
    rawData: messageStruct
  });
};

const MainCreateNewCharacterRequest = async ({buffer, socket}) => {
  const userId = socket.remotePort;

  if (!globalState?.users.has(userId)) {
    return;
  }
  const {username, classFlags} = globalState.users.get(userId);
  const data = new packetManager().fromBuffer(buffer).useStruct(structs.RequestCreateCharacter).toObject();
  const {name, class: classId} = data;
  let result = 0;

  const allowedCharacterClassesToCreate = [
    characterClasses.DARK_WIZARD,
    characterClasses.DARK_KNIGHT,
    characterClasses.FAIRY_ELF,
  ];

  // Check can create sum.
  if ((classFlags & 1) !== 0) {
    allowedCharacterClassesToCreate.push(characterClasses.SUMMONER);
  }

  // Check can create dl.
  if ((classFlags & 2) !== 0) {
    allowedCharacterClassesToCreate.push(characterClasses.DARK_LORD);
  }

  // Check can create mg.
  if ((classFlags & 4) !== 0) {
    allowedCharacterClassesToCreate.push(characterClasses.MAGIC_GLADIATOR);
  }

  // Check can create rf.
  if ((classFlags & 8) !== 0) {
    allowedCharacterClassesToCreate.push(characterClasses.RAGEFIGHER);
  }

  if (!allowedCharacterClassesToCreate.includes(classId)) {
    sendFailCharacterCreateResult({socket, result});
    return;
  }
  const dbAccountCharacterResult = await db('SELECT * FROM AccountCharacter WHERE username = ?', [
    username
  ]);

  if (!dbAccountCharacterResult.length) {
    sendFailCharacterCreateResult({socket, result});
    return;
  }

  // No free character slot case.
  let haveFreeSlot = false;
  let freeSlotId = -1;
  for (let i = 1; i < 6; i++) {
    if (dbAccountCharacterResult[0][`character${i}`] === null) {
      haveFreeSlot = true;
      freeSlotId = i;
      break;
    }
  }

  if (!haveFreeSlot || freeSlotId === -1) {
    result = 2;
    sendFailCharacterCreateResult({socket, result});
    return;
  }

  // Validate already existing character name.
  const dbCharacterResult = await db('SELECT * FROM `Character` WHERE name = ?', [
    name
  ]);
  if (dbCharacterResult.length) {
    sendFailCharacterCreateResult({socket, result});
    return;
  }

  // Add the character in AccountCharacter.
  await db(`UPDATE AccountCharacter SET character${freeSlotId} = ? WHERE username = ?`, [
    name,
    username,
  ]);

  const newCharacterDefaultsConfig = getConfig('newCharacterDefaults');
  const newCharacterDefaults = newCharacterDefaultsConfig.find(characterDefaults => characterDefaults.class === classId);

  // In case the defaults for the selected class are not defined.
  if (!newCharacterDefaults) {
    sendFailCharacterCreateResult({socket, result});
    return;
  }

  // Add the character in Character.
  await db(`
  INSERT INTO \`Character\`
  SET
    username = :username,
    name = :name,
    level = :level,
    levelUpPoints = :levelUpPoints,
    class = :class,
    strength = :strength,
    agility = :agility,
    vitality = :vitality,
    energy = :energy,
    command = :command,
    inventory = :inventory,
    magicList = :magicList,
    life = :life,
    maxLife = :maxLife,
    mana = :mana,
    maxMana = :maxMana,
    mapNumber = :mapNumber,
    mapPosX = :mapPosX,
    mapPosY = :mapPosY,
    quest = :quest,
    effectList = :effectList
    `, {
    username,
    name,
    level: newCharacterDefaults.level,
    levelUpPoints: newCharacterDefaults.levelUpPoints,
    class: classId,
    strength: newCharacterDefaults.strength,
    agility: newCharacterDefaults.agility,
    vitality: newCharacterDefaults.vitality,
    energy: newCharacterDefaults.energy,
    command: newCharacterDefaults.command,
    inventory: newCharacterDefaults.inventory,
    magicList: newCharacterDefaults.magicList,
    life: newCharacterDefaults.life,
    maxLife: newCharacterDefaults.maxLife,
    mana: newCharacterDefaults.mana,
    maxMana: newCharacterDefaults.maxMana,
    mapNumber: newCharacterDefaults.mapNumber,
    mapPosX: newCharacterDefaults.mapPosX,
    mapPosY: newCharacterDefaults.mapPosY,
    quest: newCharacterDefaults.quest,
    effectList: newCharacterDefaults.effectList
  });

  result = 1;

  const messageStruct = {
    header: {
      type: 0xC1,
      size: 'auto',
      headCode: 0xF3,
      subCode: 0x01,
    },
    result,
    name,
    slot: freeSlotId - 1,
    level: newCharacterDefaults.level,
    class: characterClassesProtocol[classId]
  };
  const message = new packetManager().useStruct(structs.CreateCharacterSend).toBuffer(messageStruct);
  sendDataToClient({
    socket,
    data: message,
    description: 'CharacterCreateResult',
    rawData: messageStruct
  });
};

const sendFailCharacterCreateResult = ({socket, result}) => {
  const failMessageStruct = {
    header: {
      type: 0xC1,
      size: 'auto',
      headCode: 0xF3,
      subCode: 0x01,
    },
    result,
  };
  const message = new packetManager().useStruct(structs.CreateCharacterFailSend).toBuffer(failMessageStruct);
  sendDataToClient({
    socket,
    data: message,
    description: 'CharacterCreateResultFail',
    rawData: failMessageStruct
  });
};

module.exports = {
  startTCPServer,
  tcpSockets,
  stopTCPServer,
  onReceive
};
