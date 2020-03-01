import { TwincatVariable } from '../twincat-connector/twincat-interfaces';

export class Logger{
  trace(msg:string){}
  debug(msg:string){}
  info(msg:string){}
  warning(msg:string){}
  error(msg:string){}
}

export class TwincatClient {
  readState(callback:Function){}
  readWrite(indexGroup: string, indexOffset: string, cbRdLen: string, pwrData: string, callback:Function) {}
}

export class TwincatConnectorService{
  checkTwincatRunning(callback:Function){}
  readPlcNumbers(varsToRead:TwincatVariable[], readPlcVarsCallback:Function){}
  readPlcString(varToRead:TwincatVariable, readPlcStringCallback: Function){}
  readPlcArray(arrayToRead:TwincatVariable, readPlcArrayCallback: Function){}
  writePlcNumbers(varsToWrite:TwincatVariable[]){}
  writePlcString(varToWrite:TwincatVariable, stringValue:string){}
  updatePlcArray(arrayToWrite:TwincatVariable, values:number[]){}
}
