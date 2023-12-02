const characterClasses = require('./characterClasses');
module.exports = {
  [characterClasses.DARK_WIZARD]: 0x0,
  [characterClasses.SOUL_MASTER]: 0x10,
  [characterClasses.GRAND_MASTER]: 0x18,

  [characterClasses.DARK_KNIGHT]: 0x20,
  [characterClasses.BLADE_KNIGHT]: 0x30,
  [characterClasses.BLADE_MASTER]: 0x38,

  [characterClasses.FAIRY_ELF]: 0x40,
  [characterClasses.MUSE_ELF]: 0x50,
  [characterClasses.HIGH_ELF]: 0x58,

  [characterClasses.MAGIC_GLADIATOR]: 0x60,
  [characterClasses.DUEL_MASTER]: 0x78,

  [characterClasses.DARK_LORD]: 0x80,
  [characterClasses.LORD_EMPEROR]: 0x98,

  [characterClasses.SUMMONER]: 0x0A0,
  [characterClasses.BLOODY_SUMMONER]: 0x0B0,
  [characterClasses.DIMENSION_MASTER]: 0x0B8,

  [characterClasses.RAGEFIGHER]: 0xC0,
  [characterClasses.FIST_MASTER]: 0xD8,
};
