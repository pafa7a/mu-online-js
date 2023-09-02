const byteToNiceHex = data => {
  const hex = Buffer.from(data).toString('hex');
  const arr = hex.toUpperCase().match(/.{1,2}/g);
  return arr.join(' ');
};

module.exports = byteToNiceHex;
