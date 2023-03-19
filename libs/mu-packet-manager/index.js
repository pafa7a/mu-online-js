/**
 * Creates a new Packet object.
 * @constructor
 */
function Packet() {
  /**
   * The buffer that contains the packet data.
   * @type {Buffer}
   */
  this.buf = Buffer.alloc(0);

  /**
   * The current offset of the packet data buffer.
   * @type {number}
   */
  this.currentOffset = 0;

  /**
   * The object that holds the parsed packet data.
   * @type {object}
   */
  this.obj = {};

  /**
   * The type of the last packet data that was parsed.
   * @type {string}
   */
  this.lastType = undefined;

  /**
   * The structure of the packet data.
   * @type {object}
   */
  this.structure = {};
}

/**
 * Sets the buffer that contains the packet data.
 * @param {Buffer} buffer - The buffer that contains the packet data.
 * @returns {Packet} The Packet object.
 */
Packet.prototype.fromBuffer = function (buffer) {
  this.buf = buffer;
  return this;
};

/**
 * Converts the packet data to an object using the current structure.
 * @returns {object} The object that holds the parsed packet data.
 */
Packet.prototype.toObject = function () {
  const decodeObject = (object, structure, parentKey = '') => {
    for (let key in structure) {
      const type = structure[key];
      const fullKey = parentKey ? `${parentKey}.${key}` : key;
      if (typeof type === 'object') {
        object[key] = {};
        decodeObject(object[key], type, fullKey);
      } else {
        this.decodeByType(type, fullKey, object);
      }
    }
  };
  decodeObject(this.obj, this.structure);
  return this.obj;
};

/**
 * Decodes a packet based on the given type and stores the result in the provided object.
 *
 * @method decodeByType
 * @memberof Packet.prototype
 *
 * @param {string} type - The type of data to decode. Valid values are 'byte' and 'word'.
 * @param {string} key - The key to store the decoded data in the object.
 * @param {Object} objectToStore - The object to store the decoded data in.
 *
 * @returns {void}
 */
Packet.prototype.decodeByType = function (type, key, objectToStore) {
  switch (type) {
    case 'byte':
      objectToStore[key] = this.buf.readUInt8(this.currentOffset);
      this.currentOffset++;
      this.lastType = 'byte';
      break;
    case 'word':
      if (this.lastType !== 'word') {
        this.currentOffset++;
      }
      objectToStore[key] = this.buf.readUInt16LE(this.currentOffset);
      this.currentOffset += 2;
      this.lastType = 'word';
      break;
  }
}

/**
 * Converts an object to a buffer using the current structure.
 * @param {object} obj - The object to encode.
 * @returns {Buffer} The encoded buffer.
 */
Packet.prototype.toBuffer = function (obj) {
  if (obj?.header?.size) {
    obj.header.size = this.calculateBufferSize(this.structure);
  }
  this.obj = obj;
  this.buf = Buffer.alloc(obj.header.size);
  const encodeObject = (object, structure, parentKey = '') => {
    for (let key in structure) {
      const type = structure[key];
      const fullKey = parentKey ? `${parentKey}.${key}` : key;
      if (typeof type === 'object') {
        encodeObject(object[key], type, fullKey);
      } else {
        this.encodeByType(type, object[key]);
      }
    }
  };
  encodeObject(this.obj, this.structure);
  return this.buf;
};

/**
 * Encodes a value based on the provided data type and writes it to the buffer.
 *
 * @param {string} type - The data type of the value to encode.
 * @param {number} value - The value to encode.
 */
Packet.prototype.encodeByType = function (type, value) {
  switch (type) {
    case 'byte':
      this.buf.writeUInt8(value, this.currentOffset);
      this.currentOffset++;
      this.lastType = 'byte';
      break;
    case 'word':
      if (this.lastType !== 'word') {
        this.buf.writeUInt8(0xCC, this.currentOffset);
        this.currentOffset++;
      }
      this.buf.writeUInt16LE(value, this.currentOffset);
      this.currentOffset += 2;
      this.lastType = 'word';
      break;
  }
};

/**
 * Calculates the size of the buffer required to store the provided struct.
 *
 * @param {object} struct - An object representing the structure of the data to be encoded.
 * Each key in the object represents a field in the structure, and its value is the data type of the field.
 * If the data type is an object, it is assumed to represent a sub-structure, and its length is counted as 1 byte.
 * @returns {number} - The total size, in bytes, required to store the provided struct.
 */
Packet.prototype.calculateBufferSize = function(struct) {
  let size = 0;
  for (let key in struct) {
    const type = struct[key];
    if (typeof type === 'object') {
      size += Object.keys(type).length;
      this.lastType = 'byte';
    }
    else {
      switch (type) {
        case 'byte':
          size += 1;
          this.lastType = 'byte';
          break;
        case 'word':
          if (this.lastType !== 'word') {
            size++;
          }
          size += 2;
          this.lastType = 'word';
          break;
      }
    }
  }
  return size;
}

/**
 * Returns the available structures.
 * @returns {object} The available structures.
 */
Packet.getStructs = function () {
  return require('./structs');
};

/**
 * Sets the structure of the packet data.
 * @param {object} structure - The structure of the packet data.
 * @returns {Packet} The Packet object.
 */
Packet.prototype.useStruct = function (structure) {
  this.structure = structure;
  return this;
};

module.exports = Packet;
