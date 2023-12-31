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

export interface StandardHeader  {
  header: {
    type: string,
    size: string,
    headCode: string,
  }
}
interface SubcodeHeader extends StandardHeader {
  header: StandardHeader['header'] & {
    subCode: string;
  };
}

export type PacketWithStandardHeader = StandardHeader | Record<string, PacketType>;
export type PacketWithSubcodeHeader = SubcodeHeader | Record<string, PacketType|array>;

