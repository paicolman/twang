export class DataWriter {

  dataToEncode:string[] = [];

  writeDWORD(num:number) {
    const arr = new Uint8Array([
      (num & 0x000000ff) >> 0,
      (num & 0x0000ff00) >> 8,
      (num & 0x00ff0000) >> 16,
      (num & 0xff000000) >> 24
    ]);
    let result = "";
    for (const b in arr) {
      result += String.fromCharCode(arr[b]);
    }
    this.dataToEncode.push(result);
  }

  writeString(str: string) {
    this.dataToEncode.push(str);
  }

  encodeData(): string {
    var stringToEncode = "";
    for (const data in this.dataToEncode) {
      stringToEncode += this.dataToEncode[data];
    }
    return btoa(stringToEncode);
  }
}
