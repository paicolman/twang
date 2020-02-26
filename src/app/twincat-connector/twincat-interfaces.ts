export interface TwincatVariable {
  name: string;
  type: TwincatDatatype;
  value: number;
}

export interface TwincatString {
  name: string;
  value: string;
}

export enum TwincatDatatype {
  bool = 1,
  sint = -1,
  int = -2,
  dint = -4,
  byte = 1,
  uint = 2,
  word = 2,
  dword = 4,
  real = 5, //Special case, otherwise the doubleword gets wrong.
  lreal = 8,
  string = 9,
}
