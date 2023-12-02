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
  const decodeObject = (object, structure) => {
    for (let key in structure) {
      const type = structure[key];
      if (typeof type === 'object') {
        object[key] = {};
        decodeObject(object[key], type, key);
      } else {
        this.decodeByType(type, key, object);
      }
    }
  };
  decodeObject(this.obj, this.structure);
  if (process.env.DEBUG_VERBOSE) {
    console.log(JSON.stringify(this.obj, null, 2));
  }
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
  try {
    switch (type) {
      case 'byte':
        objectToStore[key] = this.buf.readUInt8(this.currentOffset);
        this.currentOffset++;
        break;
      case 'arrayPadding':
        //objectToStore[key] = 0xC1;
        this.currentOffset++;
        break;
      case 'word':
        if (this.lastType !== 'word') {
          this.currentOffset++;
        }
        objectToStore[key] = this.buf.readUInt16LE(this.currentOffset);
        this.currentOffset += 2;
        break;
      case 'wordBE':
        objectToStore[key] = this.buf.readUInt16BE(this.currentOffset);
        this.currentOffset += 2;
        break;
      case 'wordLE':
        objectToStore[key] = this.buf.readUInt16LE(this.currentOffset);
        this.currentOffset += 2;
        break;
      case 'shortBE':
      case 'short':
        objectToStore[key] = this.buf.readUInt16BE(this.currentOffset);
        this.currentOffset += 2;
        break;
      case 'shortLE':
        objectToStore[key] = this.buf.readUInt16LE(this.currentOffset);
        this.currentOffset += 2;
        break;
      case 'dword':
        objectToStore[key] = this.buf.readUInt32LE(this.currentOffset);
        this.currentOffset += 4;
        break;
      case 'dwordBE':
        objectToStore[key] = this.buf.readUInt32BE(this.currentOffset);
        this.currentOffset += 4;
        break;
    }
  } catch (e) {
    // Probably incomplete packet or optional parameters.
  }

  // Handle chars.
  const charsMatch = type.match(/^char\((\d+)\)$/);
  if (charsMatch) {
    const length = parseInt(charsMatch[1]);
    objectToStore[key] = this.buf.toString('utf8', this.currentOffset, this.currentOffset+length).replace(/\x00.*$/g, '');
    this.currentOffset += length;
  }

  // Handle predefined bytes length.
  const byteMatch = type.match(/^byte\((\d+)\)$/);
  if (byteMatch) {
    const length = parseInt(byteMatch[1]);
    objectToStore[key] = this.buf.toString('utf8', this.currentOffset, this.currentOffset+length).replace(/\x00.*$/g, '');
    this.currentOffset += length;
  }
  this.lastType = type;
};

/**
 * Converts an object to a buffer using the current structure.
 * @param {object} obj - The object to encode.
 * @returns {Buffer} The encoded buffer.
 */
Packet.prototype.toBuffer = function (obj) {
  if (obj?.header?.size) {
    obj.header.size = this.calculateBufferSize(this.structure, obj);
  }
  this.obj = obj;
  this.buf = Buffer.alloc(obj.header.size);
  const encodeObject = (object, structure, parentKey = '') => {
    for (let key in structure) {
      const type = structure[key];
      const fullKey = parentKey ? parentKey : key;
      if (typeof type === 'object') {
        if (Array.isArray(type)) {
          for (let i = 0; i < object[fullKey].length; i++) {
            encodeObject(object[key][i], type[0], `${fullKey}.${i}`);
          }
        }
        else {
          encodeObject(object[key], type, fullKey);
        }
      }
      else {
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
 * @param {number|string} value - The value to encode.
 */
Packet.prototype.encodeByType = function (type, value) {
  try {
    switch (type) {
      case 'byte':
        this.buf.writeUInt8(value, this.currentOffset);
        this.currentOffset++;
        break;
      case 'arrayPadding':
        this.buf.writeUInt8(0xC1, this.currentOffset);
        this.currentOffset++;
        break;
      case 'word':
        if (this.lastType !== 'word') {
          this.buf.writeUInt8(0xCC, this.currentOffset);
          this.currentOffset++;
        }
        this.buf.writeUInt16LE(value, this.currentOffset);
        this.currentOffset += 2;
        break;
      case 'wordLE':
        this.buf.writeUIntLE(value, this.currentOffset, 2);
        this.currentOffset += 2;
        break;
      case 'wordBE':
        this.buf.writeUIntBE(value, this.currentOffset, 2);
        this.currentOffset += 2;
        break;
      case 'shortBE':
      case 'short':
        this.buf.writeUInt16BE(value, this.currentOffset);
        this.currentOffset += 2;
        break;
      case 'shortLE':
        this.buf.writeUInt16LE(value, this.currentOffset);
        this.currentOffset += 2;
        break;
      case 'dword':
        this.buf.writeUInt32LE(value, this.currentOffset);
        this.currentOffset += 4;
        break;
      case 'dwordBE':
        this.buf.writeUInt32BE(value, this.currentOffset);
        this.currentOffset += 4;
        break;
    }
  } catch (e) {
    // Probably incomplete packet or optional parameters.
  }
  // Handle chars.
  const charMatch = type.match(/^char\((\d+)\)$/);
  if (charMatch) {
    const length = parseInt(charMatch[1]);
    this.buf.write(value, this.currentOffset, length, 'utf8');
    this.currentOffset += length;
  }

  // Handle predefined bytes length.
  const byteMatch = type.match(/^byte\((\d+)\)$/);
  if (byteMatch) {
    const length = parseInt(byteMatch[1]);
    Buffer.from(value).copy(this.buf, this.currentOffset);
    this.currentOffset += length;
  }

  this.lastType = type;
};

/**
 * Calculates the size of the buffer required to store the provided struct.
 *
 * @param {object} struct - An object representing the structure of the data to be encoded.
 * Each key in the object represents a field in the structure, and its value is the data type of the field.
 * If the data type is an object, it is assumed to represent a sub-structure, and its length is counted as 1 byte.
 * @returns {number} - The total size, in bytes, required to store the provided struct.
 * @param {object} obj
 */
Packet.prototype.calculateBufferSize = function(struct, obj) {
  let size = 0;
  for (let key in struct) {
    const type = struct[key];
    if (typeof type === 'object') {
      if (Array.isArray(obj[key])) {
        for (let i = 0; i < obj[key].length; i++) {
          size += this.calculateBufferSize(type, obj);
        }
      }
      else {
        size += this.calculateBufferSize(type, obj);
      }
    }
    else {
      switch (type) {
        case 'byte':
        case 'arrayPadding':
          size += 1;
          break;
        case 'word':
          if (this.lastType !== 'word') {
            size++;
          }
          size += 2;
          break;
        case 'wordLE':
        case 'wordBE':
          size += 2;
          break;
        case 'short':
        case 'shortBE':
        case 'shortLE':
          size += 2;
          break;
        case 'dword':
        case 'dwordBE':
          size += 4;
          break;
      }
      // Handle chars.
      const charMatch = type.match(/^char\((\d+)\)$/);
      if (charMatch) {
        const length = parseInt(charMatch[1]);
        size += length;
      }

      // Handle predefined bytes length.
      const byteMatch = type.match(/^byte\((\d+)\)$/);
      if (byteMatch) {
        const length = parseInt(byteMatch[1]);
        size += length;
      }

      this.lastType = type;
    }
  }
  return size;
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
