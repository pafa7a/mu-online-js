const mysql = require('mysql2/promise');
const config = require('./../config/db');

(async () => {
  const db = await mysql.createConnection({
    host: config.host,
    user: config.user,
    password: config.password,
  });

  // Create the MuOnline database.
  await db.query('CREATE DATABASE IF NOT EXISTS ??;', [config.MuOnlineDB]);

  // Switch to the MuOnline database.
  await db.query(`USE ${config.MuOnlineDB};`);

  const createMembInfoTableQuery = `CREATE TABLE IF NOT EXISTS MEMB_INFO (
    memb_guid INT(11) NOT NULL AUTO_INCREMENT,
    memb___id VARCHAR(11) NOT NULL,
    memb__pwd VARCHAR(11) NOT NULL,
    sno__numb CHAR(14) NOT NULL,
    bloc_code INT(1) NOT NULL DEFAULT 0,
    PRIMARY KEY (memb_guid),
    UNIQUE KEY memb___id_UNIQUE (memb___id)
  ) ENGINE = InnoDB AUTO_INCREMENT = 1 DEFAULT CHARSET = utf8`;
  await db.query(createMembInfoTableQuery);

  const createMembStatTableQuery = `CREATE TABLE IF NOT EXISTS MEMB_STAT (
    memb___id VARCHAR(10) NOT NULL,
    ConnectStat TINYINT NULL,
    ServerName VARCHAR(50) NULL,
    IP VARCHAR(15) NULL,
    ConnectTM DATETIME NULL,
    DisConnectTM DATETIME NULL,
    OnlineHours INT NULL DEFAULT 0,
    PRIMARY KEY (memb___id)
  ) ENGINE = InnoDB DEFAULT CHARSET = utf8`;
  await db.query(createMembStatTableQuery);

  const createAccountCharacterTableQuery = `CREATE TABLE IF NOT EXISTS AccountCharacter (
    id INT(11) NOT NULL AUTO_INCREMENT,
    username VARCHAR(10) NOT NULL,
    character1 VARCHAR(10)  NULL,
    character2 VARCHAR(10)  NULL,
    character3 VARCHAR(10)  NULL,
    character4 VARCHAR(10)  NULL,
    character5 VARCHAR(10)  NULL,
    lastUsedCharacter VARCHAR(10)  NULL,
    PRIMARY KEY (id),
    UNIQUE KEY id (id)
  ) ENGINE = InnoDB DEFAULT CHARSET = utf8`;
  await db.query(createAccountCharacterTableQuery);

  const createCharacterTableQuery = `CREATE TABLE IF NOT EXISTS \`Character\` (
    username varchar(10) not null,
    name varchar(10) not null,
    level int default 1 null,
    resets int default 0 null,
    masterResets int default 0 null,
    levelUpPoints int default 0 null,
    class tinyint unsigned null,
    experience int default 0 null,
    strength int default 0 null,
    agility int default 0 null,
    vitality int default 0 null,
    energy int default 0 null,
    command int default 0 null,
    inventory varchar(3456) null,
    magicList varchar(360) null,
    money int default 0 null,
    life double default 0 null,
    maxLife double default 0 null,
    mana double default 0 null,
    maxMana double default 0 null,
    BP double default 0 null,
    maxBP double default 0 null,
    shield double default 0 null,
    maxShield double default 0 null,
    mapNumber smallint default 0 null,
    mapPosX smallint default 0 null,
    mapPosY smallint default 0 null,
    mapDir tinyint unsigned default '0' null,
    pkCount int default 0 null,
    pkLevel int default 3 null,
    pkTime int default 0 null,
    dateCreated datetime DEFAULT CURRENT_TIMESTAMP null,
    ctlCode tinyint unsigned default '0' null,
    quest varchar(100) default 0x30 null,
    chatLimitTime smallint default 0 null,
    fruitPoint int default 0 null,
    effectList varchar(416) null,
    fruitAddPoint int default 0 not null,
    fruitSubPoint int default 0 not null,
    kills int default 0 not null,
    deaths int default 0 not null,
    block_Expire datetime null,
    PRIMARY KEY (\`name\`),
    UNIQUE KEY id (\`name\`)
    ) ENGINE = InnoDB DEFAULT CHARSET = utf8`;
  await db.query(createCharacterTableQuery);

  const createGuildTableQuery = `CREATE TABLE IF NOT EXISTS Guild (
    guildName VARCHAR(8) NOT NULL,
    guildMark VARCHAR(64) NULL,
    guildScore int default 0 NULL,
    guildMaster VARCHAR(10) NULL,
    guildNotice VARCHAR(60) NULL,
    PRIMARY KEY (\`guildName\`),
    UNIQUE KEY id (\`guildName\`)
  ) ENGINE = InnoDB DEFAULT CHARSET = utf8`;
  await db.query(createGuildTableQuery);

  const createGuildMemberTableQuery = `CREATE TABLE IF NOT EXISTS GuildMember (
    guildPlayerName VARCHAR(10) NOT NULL,
    guildName VARCHAR(8) NOT NULL,
    guildStatus int default 0 NULL,
    PRIMARY KEY (\`guildPlayerName\`),
    UNIQUE KEY id (\`guildPlayerName\`)
  ) ENGINE = InnoDB DEFAULT CHARSET = utf8`;
  await db.query(createGuildMemberTableQuery);

  await db.end();
})();



