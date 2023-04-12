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

  await db.end();
})();
