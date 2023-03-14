const byteToNiceHex = (data: Uint8Array) : string => {
  const hex = Buffer.from(data).toString('hex');
  const arr = hex.toUpperCase().match(/.{1,2}/g) || [];
  return arr.join(' ');
}

export default byteToNiceHex;
