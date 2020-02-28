import { NGXLogger } from 'ngx-logger'
import { TwincatDatatype, TwincatVariable } from './twincat-interfaces';

export class DataWriter {

  dataToEncode:string[] = [];
  //logger: NGXLogger

  constructor(private logger: NGXLogger) {
    //this.logger = logger
  }

  writeANYTHING(varToWrite:TwincatVariable) {
    this.logger.trace("DataWriter.writeANYTHING("+varToWrite.name+", type:"+varToWrite.type+",value:"+varToWrite.value+")")
    switch(varToWrite.type) {
      case TwincatDatatype.sint:
        this.writeSINT(varToWrite.value)
      break
      case TwincatDatatype.int:
        this.writeINT(varToWrite.value)
      break
      case TwincatDatatype.dint:
        this.writeDINT(varToWrite.value)
      break
      case TwincatDatatype.dint:
        this.writeWORD(varToWrite.value)
      break
      case TwincatDatatype.byte:
        this.writeBYTE(varToWrite.value)
      break
      case TwincatDatatype.word:
        this.writeWORD(varToWrite.value)
      break
      case TwincatDatatype.dword:
        this.writeDWORD(varToWrite.value)
      break
      case TwincatDatatype.bool:
        this.writeBOOL(varToWrite.value)
      break
      case TwincatDatatype.real:
        this.writeREAL(varToWrite.value)
      break
      case TwincatDatatype.lreal:
        this.writeLREAL(varToWrite.value)
      break
    }
  }

  writeSINT(num:number) {
    this.logger.trace("DataWriter.writeSINT("+num+")")
    const byteValue = new DataView(Uint8Array.of(num).buffer).getUint8(0)
    const arr = new Uint8Array([
      (byteValue & 0x000000ff) >> 0
    ]);
    let result = "";
    for (const b in arr) {
      result += String.fromCharCode(arr[b]);
    }
    this.dataToEncode.push(result);
  }

  writeINT(num:number) {
    this.logger.trace("DataWriter.writeINT("+num+")")
    let byteArr = []
    for(let i in [0,1]) {
      byteArr.push(new DataView(Uint16Array.of(num).buffer).getUint8(i))
    }
    let result = "";
    for (const b in byteArr) {
      result += String.fromCharCode(byteArr[b]);
    }
    this.dataToEncode.push(result);
  }

  writeDINT(num:number) {
    this.logger.trace("DataWriter.writeDINT("+num+")")
    let byteArr = []
    for(let i in [0,1,2,3]) {
      byteArr.push(new DataView(Uint32Array.of(num).buffer).getUint8(i))
    }
    let result = "";
    for (const b in byteArr) {
      result += String.fromCharCode(byteArr[b]);
    }
    this.dataToEncode.push(result);
  }

  writeBYTE(num:number) {
    this.logger.trace("DataWriter.writeBYTE("+num+")")
    const arr = new Uint8Array([
      (num & 0x000000ff) >> 0
    ]);
    let result = "";
    for (const b in arr) {
      result += String.fromCharCode(arr[b]);
    }
    this.dataToEncode.push(result);
  }

  writeBOOL(num:number) {
    this.logger.trace("DataWriter.writeBOOL("+num+")")
    if (num > 1) {
      num = 1
      this.logger.warn("DataWriter.writeBOOL: Found boolean value greater than 1. Converting to 1")
    }
    const arr = new Uint8Array([
      (num & 0x000000ff) >> 0
    ]);
    let result = "";
    for (const b in arr) {
      result += String.fromCharCode(arr[b]);
    }
    this.dataToEncode.push(result);
  }

  writeWORD(num:number) {
    this.logger.trace("DataWriter.writeWORD("+num+")")
    const arr = new Uint8Array([
      (num & 0x000000ff) >> 0,
      (num & 0x0000ff00) >> 8
    ]);
    let result = "";
    for (const b in arr) {
      result += String.fromCharCode(arr[b]);
    }
    this.dataToEncode.push(result);
  }

  writeDWORD(num:number) {
    this.logger.trace("DataWriter.writeDWORD("+num+")")
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

  writeREAL(num:number) {
    this.logger.trace("DataWriter.writeREAL("+num+")")
    const buffer = Float32Array.of(num).buffer
    let byteArr = new Uint8Array(buffer)

    let result = "";
    for (const b in byteArr) {
      result += String.fromCharCode(byteArr[b]);
    }
    this.dataToEncode.push(result);
  }

  writeLREAL(num:number) {
    this.logger.trace("DataWriter.writeLREAL("+num+")")
    const buffer = Float64Array.of(num).buffer
    let byteArr = new Uint8Array(buffer)

    let result = "";
    for (const b in byteArr) {
      result += String.fromCharCode(byteArr[b]);
    }
    this.dataToEncode.push(result);
  }

  writeString(str: string) {
    this.logger.trace("DataWriter.writeString("+str+")")
    this.dataToEncode.push(str);
  }

  encodeData(): string {
    var stringToEncode = "";
    for (const data in this.dataToEncode) {
      stringToEncode += this.dataToEncode[data];
    }
    this.logger.trace("DataWriter.encodeData():"+btoa(stringToEncode))
    return btoa(stringToEncode);
  }
}
