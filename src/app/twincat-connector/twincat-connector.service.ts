import { Injectable } from '@angular/core';
import { TwincatClient } from './twincat-client';
import { HttpClient } from '@angular/common/http';

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

  twincatRunning() : Boolean {
    this.twincat.readState();
    return true;
  }
}
