import { Injectable } from '@angular/core';
import { TwincatClient } from './twincat-client';
import { HttpClient } from '@angular/common/http';
import { DataWriter } from './data-writer';

@Injectable({
  providedIn: 'root'
})
export class TwincatConnectorService {

  //TODO: These would need to be parametrized
  service = "https://192.168.1.133/TcAdsWebService/TcAdsWebService.dll";
  adsNetId = "192.168.1.133.1.1";
  port = 801;
  twincat : TwincatClient;


  constructor(private http:HttpClient){
    console.info('TwincatConnectorService instantiated');
    this.twincat = new TwincatClient(this.http);
    this.twincat.service = this.service;
    this.twincat.adsNetId = this.adsNetId;
    this.twincat.port = this.port;
  }

  checkTwincatRunning(callback:Function) {
    this.twincat.readState(callback);
  }

  private getVarHandles(varsToRead:string[], varHandlesCallback:Function) {
    const varHandleDataWriter = new DataWriter();
    for (const idx in varsToRead) {
      varHandleDataWriter.writeDWORD(0xF003);//0xF003
      varHandleDataWriter.writeDWORD(0);
      varHandleDataWriter.writeDWORD(4);
      varHandleDataWriter.writeDWORD(varsToRead[idx].length);
    }
    for (const idx in varsToRead) {
      varHandleDataWriter.writeString(varsToRead[idx]);
    }
    const indexGroup = String(0xF082)
    const indexOffset = String(varsToRead.length);
    const cbRdLen = String((varsToRead.length * 4) + (varsToRead.length * 8));
    const encodedData = varHandleDataWriter.encodeData();
    this.twincat.readWrite(indexGroup,indexOffset, cbRdLen, encodedData, 4, varHandlesCallback); //! The "4" is wrong here!
  }

  readIntegerTrial(){
    //GetVarhandle first
    //Symbol handle by name: 61443 then Dword 0 and Dword 4:
    const varHandleDataWriter = new DataWriter();
    varHandleDataWriter.writeDWORD(0xF003);//0xF003
    varHandleDataWriter.writeDWORD(0);
    varHandleDataWriter.writeDWORD(4);

    const varName = "_70_WETTERSTATION.SUN_MAX";//"_50_DIMMER_BM01_00_LD3.OUT_BYTE";
    varHandleDataWriter.writeDWORD(varName.length);
    varHandleDataWriter.writeString(varName);

    const encoded = varHandleDataWriter.encodeData();
    console.info('encoded:'+encoded);
    const indexGroup = String(0xF082)
    const indexOffset = "1";
    const cbRdLen = "12";
    this.twincat.readWrite(indexGroup,indexOffset, cbRdLen, encoded, 4,this.gotHandle);
  }

  gotHandle = (handle:number) => {
    console.info("Variable handle:"+handle);
    const symbolDataWriter = new DataWriter();
    symbolDataWriter.writeDWORD(0xF005);
    symbolDataWriter.writeDWORD(handle);
    symbolDataWriter.writeDWORD(2);
    //const symbolValueByHandle = this.toBytes32(61445);
    //const varHandle = this.toBytes32(handle);
    //const varSize = this.toBytes32(2); //2 for INT
    const encoded = symbolDataWriter.encodeData();
    const indexGroup = String(0xF080);
    const indexOffset = "1";
    const cbRdLen = "6"; // (1 parameter set + 4*Variables(1))
    this.twincat.readWrite(indexGroup, indexOffset, cbRdLen, encoded, 2, this.gotValue);
  }

  gotValue = (value:number) => {
    console.info("var value:"+value);
  }
}

export interface twincatVariable {
  varName:string;
  varType:string; //TODO: Should not be a string, but another interface, I think...
}
