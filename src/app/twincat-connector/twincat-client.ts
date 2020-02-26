import { HttpClient } from '@angular/common/http';
import * as xml2js from 'xml2js';
import { SoapDecoder } from './soap-decoder';
import { NGXLogger } from 'ngx-logger';

export class TwincatClient {
  service: string
  adsNetId: string
  port: number
  retValue:boolean;

  constructor(private http: HttpClient, private logger: NGXLogger) {
    console.info("TwincatClient instantiated");
  }

  readState(callback) {
    const message =
                "<?xml version=\"1.0\" encoding=\"utf-8\"?>" +
                "<SOAP-ENV:Envelope " +
                "xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance/\" " +
                "xmlns:xsd=\"http://www.w3.org/2001/XMLSchema/\" " +
                "xmlns:SOAP-ENV=\"http://schemas.xmlsoap.org/soap/envelope/\" " +
                "SOAP-ENV:encodingStyle=\"http://schemas.xmlsoap.org/soap/encoding/\" >" +
                "<SOAP-ENV:Body><q1:ReadState xmlns:q1=\"http://beckhoff.org/message/\">" +
                "<netId xsi:type=\"xsd:string\">" + this.adsNetId + "</netId>" +
                "<nPort xsi:type=\"xsd:int\">" + this.port + "</nPort>" +
                "</q1:ReadState></SOAP-ENV:Body></SOAP-ENV:Envelope>";

    this.sendMessage(message, callback);
  }

  readWrite(indexGroup: string, indexOffset: string, cbRdLen: string, pwrData: string, callback:Function) {
    this.logger.trace("readWrite("+indexGroup+","+indexOffset+","+cbRdLen+","+pwrData+",<callback>)");
    let message =
            "<?xml version=\"1.0\" encoding=\"utf-8\"?>" +
            "<SOAP-ENV:Envelope " +
            "xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance/\" " +
            "xmlns:xsd=\"http://www.w3.org/2001/XMLSchema/\" " +
            "xmlns:SOAP-ENV=\"http://schemas.xmlsoap.org/soap/envelope/\" " +
            "SOAP-ENV:encodingStyle=\"http://schemas.xmlsoap.org/soap/encoding/\" >" +
            "<SOAP-ENV:Body><q1:ReadWrite xmlns:q1=\"http://beckhoff.org/message/\">" +
            "<netId xsi:type=\"xsd:string\">" + this.adsNetId + "</netId>" +
            "<nPort xsi:type=\"xsd:int\">" + this.port + "</nPort>" +
            "<indexGroup xsi:type=\"xsd:unsignedInt\">" + indexGroup + "</indexGroup>" +
            "<indexOffset xsi:type=\"xsd:unsignedInt\">" + indexOffset + "</indexOffset>" +
            "<cbRdLen xsi:type=\"xsd:int\">" + cbRdLen + "</cbRdLen>" +
            "<pwrData xsi:type=\"xsd:base64Binary\">" + pwrData + "</pwrData>" +
            "</q1:ReadWrite></SOAP-ENV:Body></SOAP-ENV:Envelope>"

    this.sendMessage(message, callback);
  }

  private sendMessage(message:String, callback:Function) {
    const headers = {'Content-Type': 'text/xml'}
    this.http.post(this.service, message, {headers, responseType:'text'}).subscribe(//(x) => this.responseObserver())
      (xmlResponse) => {
        const parser = new xml2js.Parser({ strict: false, trim: true });
        parser.parseString(xmlResponse, (err:JSON, result:JSON) => {
          this.logger.trace("sendMessage result:");
          this.logger.trace(result);
          const soap = new SoapDecoder(this.logger);
          if (message.search("ReadState") > -1){
            callback(soap.isPlcRunning(result))
          } else {
            callback(soap.decodeRWResponse(result));
          }

        });
      });
  }
}


