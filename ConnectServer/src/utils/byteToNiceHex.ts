const byteToNiceHex = (data: Uint8Array): string => {
  const hex: string = Buffer.from(data).toString('hex');
  const arr: string[] | null = hex.toUpperCase().match(/.{1,2}/g);
  return arr ? arr.join(' ') : '';
};

export = byteToNiceHex;
