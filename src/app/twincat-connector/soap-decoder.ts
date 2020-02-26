import { NGXLogger } from 'ngx-logger';

export class SoapDecoder {

  decodedJson: JSON;

  constructor(private logger: NGXLogger){}

  isPlcRunning(soapResponse: JSON): boolean {
    const jsonKeys = ["SOAP-ENV:ENVELOPE","SOAP-ENV:BODY","0","NS1:READSTATERESPONSE","0"];
    this.digInSoap(soapResponse, jsonKeys);
    return (this.decodedJson["PADSSTATE"]["0"] == 5) && (this.decodedJson["PDEVICESTATE"]["0"] == 0);
  }

  decodeRWResponse(soapResponse: JSON): string {
    const jsonKeys = ["SOAP-ENV:ENVELOPE","SOAP-ENV:BODY","0","NS1:READWRITERESPONSE","0"];
    this.digInSoap(soapResponse, jsonKeys);
    const decodedString = atob(this.decodedJson["PPRDDATA"]["0"])
    let i=0
    //Only if tracing...
    if (this.logger.getConfigSnapshot().level == 0) {
      let logMsg = "decodeRWResponse:\n";
      while (i < decodedString.length) {
        logMsg += i+": "+decodedString.charCodeAt(i).toString(16)+"\n";
        i++;
      }
      this.logger.trace(logMsg);
    }

    return decodedString;
  }



  private digInSoap(jsonObject:JSON, keys:string[]) {

    if ((keys != null) && (jsonObject != null)) {
      if(jsonObject.hasOwnProperty(keys[0])) {
        if(keys.length > 1){
          let newKeys = keys.slice(1,keys.length);
          this.digInSoap(jsonObject[keys[0]], newKeys);
        } else {
          this.digInSoap(jsonObject[keys[0]],null); //Get out next time
        }
      } else {
        //TODO: Do some error handling if the SOAP response contains "FAULT"...
        this.logger.error("JSON element not found:"+keys[0]);
        this.decodedJson = jsonObject;
      }
    } else {
      this.decodedJson = jsonObject;
    }
  }
}
