import { HttpClient } from '@angular/common/http';
import * as xml2js from 'xml2js';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export class TwincatClient {
  service: string
  adsNetId: string
  port: number

  constructor(private http: HttpClient) {
    console.info("TwincatClient instantiated");
  }

  readState() {
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

    console.info('MESSAGE DEFINE, GONNA trigger the request');
    this.sendMessage(message);
  }

  private sendMessage(message:String) {
    const headers = {'Content-Type': 'text/xml'}
    this.http.post(this.service, message, {headers, responseType:'text'}).subscribe(this.responseObserver);
  }

  private responseObserver = {
    next: xmlResponse => {
      console.info("Here is the observer");
      console.info(xmlResponse)
      const parser = new xml2js.Parser({ strict: false, trim: true });
      parser.parseString(xmlResponse, (err:JSON, result:JSON) => {
        console.info(JSON.stringify(result));

      });
    },
    error: xmlErrorResponse => {
      console.error("Here is the observer with error:");
      console.error(xmlErrorResponse);
      const parser = new xml2js.Parser({ strict: false, trim: true });
      parser.parseString(xmlErrorResponse, (err, result) => {
        console.info(result); //! this must be handled elsewhere
      });
    }
  }
}

export interface readStateResponse {
	pADSSTATE: string[];
	pDEVICESTATE: string[];
}


