import { Component } from '@angular/core'
import { TwincatConnectorService, TwincatConnectorDelegate } from './twincat-connector/twincat-connector.service'
import { HttpClient } from '@angular/common/http'
import { TwincatDatatype, TwincatVariable } from './twincat-connector/twincat-interfaces'
import { NGXLogger } from 'ngx-logger'

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements TwincatConnectorDelegate {

  title = 'twincat-connector'
  isRunning: string = "Don't know if the Twincat is running..."

  varsToRead:TwincatVariable[] = [
    {name:"MAIN.SINGLEINT", type:TwincatDatatype.sint, value:0},
    {name:"MAIN.INTEGER"   , type:TwincatDatatype.int, value:0},
    {name:"MAIN.DOUBLEINT" , type:TwincatDatatype.dint, value:0},
    {name:"MAIN.UNSIGNEDINT" , type:TwincatDatatype.uint, value:0},
    {name:"MAIN.BYTEVALUE" , type:TwincatDatatype.byte, value:0},
    {name:"MAIN.WORDVALUE" , type:TwincatDatatype.word, value:0},
    {name:"MAIN.DOUBLEWORDVALUE", type:TwincatDatatype.dword, value:0},
    {name:"MAIN.REALVALUE", type:TwincatDatatype.real, value:0},
    {name:"MAIN.LONGREAL" , type:TwincatDatatype.lreal, value:0},
    {name:"MAIN.BOOLEAN"   , type:TwincatDatatype.bool, value:0},
  ]

  varsToWrite:TwincatVariable[] = [
    {name:"MAIN.SINGLEINT", type:TwincatDatatype.sint, value:-10},
    {name:"MAIN.INTEGER"   , type:TwincatDatatype.int, value:-600},
    {name:"MAIN.DOUBLEINT" , type:TwincatDatatype.dint, value:-5465430},
    {name:"MAIN.UNSIGNEDINT" , type:TwincatDatatype.uint, value:40},
    {name:"MAIN.BYTEVALUE" , type:TwincatDatatype.byte, value:50},
    {name:"MAIN.WORDVALUE" , type:TwincatDatatype.word, value:60},
    {name:"MAIN.DOUBLEWORDVALUE", type:TwincatDatatype.dword, value:70},
    {name:"MAIN.REALVALUE", type:TwincatDatatype.real, value:-80.1234},
    {name:"MAIN.LONGREAL" , type:TwincatDatatype.lreal, value:-90.8898},
    {name:"MAIN.BOOLEAN"   , type:TwincatDatatype.bool, value:15},
  ]

  stringToRead:TwincatVariable = {name:"MAIN.STRINGVALUE", type:TwincatDatatype.string, value:15}
  stringValue = ""

  arrayToRead1:TwincatVariable = {name:"MAIN.SINTARRAY", type:TwincatDatatype.sint, value:5}
  arrayResult1:number[]
  arrayToRead2:TwincatVariable = {name:"MAIN.INTARRAY", type:TwincatDatatype.int, value:5}
  arrayResult2:number[]
  arrayToRead3:TwincatVariable = {name:"MAIN.DINTARRAY", type:TwincatDatatype.dint, value:5}
  arrayResult3:number[]
  arrayToRead4:TwincatVariable = {name:"MAIN.UINTARRAY", type:TwincatDatatype.uint, value:5}
  arrayResult4:number[]
  arrayToRead5:TwincatVariable = {name:"MAIN.BYTEARRAY", type:TwincatDatatype.byte, value:5}
  arrayResult5:number[]
  arrayToRead6:TwincatVariable = {name:"MAIN.WORDARRAY", type:TwincatDatatype.word, value:5}
  arrayResult6:number[]
  arrayToRead7:TwincatVariable = {name:"MAIN.DWORDARRAY", type:TwincatDatatype.dword, value:5}
  arrayResult7:number[]
  arrayToRead8:TwincatVariable = {name:"MAIN.REALARRAY", type:TwincatDatatype.real, value:5}
  arrayResult8:number[]
  arrayToRead9:TwincatVariable = {name:"MAIN.LREALARRAY", type:TwincatDatatype.lreal, value:5}
  arrayResult9:number[]
  arrayToRead10:TwincatVariable = {name:"MAIN.BOOLARRAY", type:TwincatDatatype.bool, value:5}
  arrayResult10:number[]

  constructor(private tcService: TwincatConnectorService, private logger: NGXLogger){
    tcService.delegate = this
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

  readPlcNumbers() {
    this.tcService.readPlcNumbers(this.varsToRead, (result) => {
      this.logger.trace("result:")
      this.logger.trace(result)
    })
    //this.tcService.readIntegerTrial()
  }
  writePlcNumbers() {
    this.tcService.writePlcNumbers(this.varsToWrite)
  }

  readString() {
    this.tcService.readPlcString(this.stringToRead, (stringValue:string) => {
      this.stringValue = stringValue
    })
  }

  writeString() {
    this.tcService.writePlcString(this.stringToRead, "something")
  }

  readAllArrays() {
    this.tcService.readPlcArray(this.arrayToRead1, (arrayResult:number[]) => {
      this.arrayResult1 = arrayResult
    })
    // await this.delay(500);
    this.tcService.readPlcArray(this.arrayToRead2, (arrayResult:number[]) => {
      this.arrayResult2 = arrayResult
    })
    // await this.delay(500);
    this.tcService.readPlcArray(this.arrayToRead3, (arrayResult:number[]) => {
      this.arrayResult3 = arrayResult
    })
    // await this.delay(500);
    this.tcService.readPlcArray(this.arrayToRead4, (arrayResult:number[]) => {
      this.arrayResult4 = arrayResult
    })
    // await this.delay(500);
    this.tcService.readPlcArray(this.arrayToRead5, (arrayResult:number[]) => {
      this.arrayResult5 = arrayResult
    })
    // await this.delay(500);
    this.tcService.readPlcArray(this.arrayToRead6, (arrayResult:number[]) => {
      this.arrayResult6 = arrayResult
    })
    // await this.delay(500);
    this.tcService.readPlcArray(this.arrayToRead7, (arrayResult:number[]) => {
      this.arrayResult7 = arrayResult
    })
    // await this.delay(500);
    this.tcService.readPlcArray(this.arrayToRead8, (arrayResult:number[]) => {
      this.arrayResult8 = arrayResult
    })
    // await this.delay(500);
    this.tcService.readPlcArray(this.arrayToRead9, (arrayResult:number[]) => {
      this.arrayResult9 = arrayResult
    })
    // await this.delay(500);
    this.tcService.readPlcArray(this.arrayToRead10, (arrayResult:number[]) => {
      this.arrayResult10 = arrayResult
    })
  }

  writeAllArrays() {
    let values = [-1, -2, -3, 4, 5]
    this.tcService.updatePlcArray(this.arrayToRead1, values)
    values = [-1000, -2000, -3000, 4000, 5000]
    this.tcService.updatePlcArray(this.arrayToRead2, values)
    values = [-10000, -20000, -30000, 40000, 50000]
    this.tcService.updatePlcArray(this.arrayToRead3, values)
    values = [1000, 2000, 3000, 4000, 5000]
    this.tcService.updatePlcArray(this.arrayToRead4, values)
    values = [10, 20, 30, 40, 50]
    this.tcService.updatePlcArray(this.arrayToRead5, values)
    values = [1000, 2000, 3000, 4000, 5000]
    this.tcService.updatePlcArray(this.arrayToRead6, values)
    values = [100050, 200050, 300050, 400050, 500050]
    this.tcService.updatePlcArray(this.arrayToRead7, values)
    values = [-1.1, 2.2, -3.3, 4.4, -5.5]
    this.tcService.updatePlcArray(this.arrayToRead8, values)
    values = [10.10, -20.20, 30.30, -40.40, 50.50]
    this.tcService.updatePlcArray(this.arrayToRead9, values)
    values = [1,1,1,1,1]
    this.tcService.updatePlcArray(this.arrayToRead10, values)
  }

  //Delegate
  errCode = 0
  errMsg = "no Error"
  error = false
  errorCallback(errCode:number, errMsg:string) {
    this.errCode = errCode
    this.errMsg = errMsg
    this.error = true
  }

private delay(ms: number)
{
  return new Promise(resolve => setTimeout(resolve, ms));
}
}

