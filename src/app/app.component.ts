import { Component, Inject } from '@angular/core'
import { TwincatConnectorService, TwincatConnectorDelegate } from './twincat-connector/twincat-connector.service'
import { TwincatDatatype, TwincatVariable } from './twincat-connector/twincat-interfaces'
import { NGXLogger } from 'ngx-logger'
import { MatSnackBar } from '@angular/material/snack-bar'

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements TwincatConnectorDelegate {

  title = 'twincat-connector'
  appName = 'Twincat Connector V1.0'
  isRunning: string = "Don't know if the Twincat is running..."


  _snackBar: MatSnackBar



  constructor(private tcService: TwincatConnectorService, private logger: NGXLogger, _snackBar:MatSnackBar){
    tcService.delegate = this
    this._snackBar = _snackBar
    this.logger.info('app.component instantiated')
    this.logger.trace('LOGGING IS ACTIVE AT LEVEL: Trace')
    this.logger.debug('LOGGING IS ACTIVE AT LEVEL: Debug')
    this.logger.info('LOGGING IS ACTIVE AT LEVEL: Info')
    this.logger.log('LOGGING IS ACTIVE AT LEVEL: Log')
    this.logger.warn('LOGGING IS ACTIVE AT LEVEL: Warning')
    this.logger.error('LOGGING IS ACTIVE AT LEVEL: Error')
    this.logger.fatal('LOGGING IS ACTIVE AT LEVEL: Fatal')
  }

  isTwincatRunning() {
    this.isRunning = "Getting twincat status..."
    this.tcService.checkTwincatRunning((tcRuns: boolean) => {
      this.isRunning = tcRuns? "Yes, the Twincat is running":"No, the Twincat is stopped"
    })
  }



  openSnackBar(message: string, action: string) {
    this._snackBar.open(message, action, {
      duration: 5000,
    });
  }

  //Delegate
  errCode = 0
  errMsg = "no Error"
  error = false
  errorCallback(errCode:number, errMsg:string) {
    this.errCode = errCode
    this.errMsg = errMsg
    this.error = true
    this.openSnackBar(errMsg,"ERROR")

  }

private delay(ms: number)
{
  return new Promise(resolve => setTimeout(resolve, ms));
}
}

