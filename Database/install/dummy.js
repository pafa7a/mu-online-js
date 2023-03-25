const db = require('./../index');

(async () => {
  const dummyDataForMembInfo = [
    ['pafa7a', '123', '12345678901234', 0],
    ['test', 'test', '23456789012345', 0],
    ['banned', 'banned', '34567890123456', 1],
  ];

  const insertInMembInfoQuery = `INSERT INTO MEMB_INFO ( memb___id, memb__pwd, sno__numb, bloc_code )
  VALUES ?`;
  await db(insertInMembInfoQuery, [dummyDataForMembInfo]);
})();
