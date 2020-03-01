import { Component, OnInit, Input } from '@angular/core';
import { TwincatVariable, TwincatDatatype } from '../twincat-connector/twincat-interfaces';
import { TwincatConnectorService } from '../twincat-connector/twincat-connector.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-read-write-string',
  templateUrl: './read-write-string.component.html',
  styleUrls: ['./read-write-string.component.css']
})
export class ReadWriteStringComponent implements OnInit {

  @Input() tcService: TwincatConnectorService
  _snackBar:MatSnackBar

  stringToRead:TwincatVariable = {name:"MAIN.STRINGVALUE", type:TwincatDatatype.string, value:40}
  stringValue:string = ""
  valueToWrite:string = ""

  constructor(tcService:TwincatConnectorService, _snackBar:MatSnackBar) {
    this.tcService = tcService
    this._snackBar = _snackBar
  }

  ngOnInit(): void {
  }


  readString() {
    this.valueToWrite = null
    this.stringValue = null
    this.tcService.readPlcString(this.stringToRead, (stringValue:string) => {
      this.stringValue = stringValue
    })
  }

  writeString() {
    console.error("ValToWrite:"+this.valueToWrite)
    this.tcService.writePlcString(this.stringToRead, this.valueToWrite)
    this.openSnackBar("String written, please read again","INFO")
  }

  typing(value:string) {
    this.valueToWrite = value
  }

  openSnackBar(message: string, action: string) {
    this._snackBar.open(message, action, {
      duration: 2000,
    });
  }

}
