import { Component } from '@angular/core';
import { TwincatConnectorService } from './twincat-connector/twincat-connector.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  title = 'twincat-connector';



  constructor(private tcService: TwincatConnectorService){
    console.info('app.component instantiated');
  }

  isTwincatRunning() {
    const runs = this.tcService.twincatRunning();
  }
}
