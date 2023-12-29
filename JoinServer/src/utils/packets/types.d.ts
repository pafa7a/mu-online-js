type Char<T> = `char(${T})`;

export type PacketType =
    'byte'
    | 'word'
    | 'wordLE'
    | 'wordBE'
    | 'dword'
    | 'short'
    | 'shortBE'
    | 'shortLE'
    | 'arrayPadding'
    | Char<number>

export type StandardHeader = {
  header: {
    type: string,
    size: string,
    headCode: string,
  }
};

export type PacketWithStandardHeader = StandardHeader | Record<string, PacketType>;

