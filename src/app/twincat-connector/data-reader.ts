
import { TwincatDatatype } from './twincat-interfaces';
import { NGXLogger } from 'ngx-logger';
import { NgModule } from '@angular/core';
import { ConvertActionBindingResult } from '@angular/compiler/src/compiler_util/expression_converter';

@NgModule({})
export class DataReader {

  offset:number;
  decodedData:string;

  constructor(data:string, private logger: NGXLogger) {
    this.offset=0;
    this.decodedData = data
  }

  readNUMBER(byteLength: TwincatDatatype) : number {

    let result = 0
    let charIdx = 0;
    while (charIdx < Math.abs(byteLength)) {
      const charValue = this.decodedData.charCodeAt(charIdx);
      const valueOfChar = charValue * Math.pow(256,(charIdx)); // the << operator does not work right!
      result += valueOfChar;
      charIdx ++;
    }
    this.decodedData = this.decodedData.substr(Math.abs(byteLength));
    this.logger.trace("readNUMBER("+byteLength+"):"+this.convertToInt(result,byteLength));
    return this.convertToInt(result,byteLength);
    //return result
  }

  readREAL() : number {
    this.logger.trace("readREAL()");
    let data:number[] = [];
    for (let charIdx = 3; charIdx >= 0; charIdx--) {
      data.push(this.decodedData.charCodeAt(charIdx));
    }
    var buf = new ArrayBuffer(4);
    var view = new DataView(buf);
    data.forEach(function (b, i) {
        view.setUint8(i, b);
    });
    this.decodedData = this.decodedData.substr(4);
    return view.getFloat32(0);
  }

  readLREAL() : number {
    this.logger.trace("readLREAL()");
    let data = []
    for (let charIdx = 7; charIdx >= 0; charIdx--) {
      data.push(this.decodedData.charCodeAt(charIdx));
    }
    var buf = new ArrayBuffer(8);
    var view = new DataView(buf);
    data.forEach(function (b, i) {
        view.setUint8(i, b);
    });
    this.decodedData = this.decodedData.substr(8);
    return view.getFloat64(0);
  }

  private convertToInt(value:number, byteLength:TwincatDatatype): number {
    let convertedResult = value;
    let convert: any;
    switch(byteLength) {
      case TwincatDatatype.sint:
        convert = Int8Array.of(value);
        break;
      case TwincatDatatype.int:
        convert = Int16Array.of(value);
        break;
      case TwincatDatatype.dint:
        convert = Int32Array.of(value);
        break;
      default:
        return convertedResult;
    }
    return convert[0];
  }
}
