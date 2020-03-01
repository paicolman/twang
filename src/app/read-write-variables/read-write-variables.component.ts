import { Component, OnInit, Input } from '@angular/core';
import { TwincatVariable, TwincatDatatype } from '../twincat-connector/twincat-interfaces';
import { TwincatConnectorService } from '../twincat-connector/twincat-connector.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-read-write-variables',
  templateUrl: './read-write-variables.component.html',
  styleUrls: ['./read-write-variables.component.css']
})
export class ReadWriteVariablesComponent implements OnInit {

  displayedColumns:string[] = ["Name","Value", "Slider", "NewValue"]

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

  isChecked: boolean
  @Input() tcService: TwincatConnectorService
  _snackBar: MatSnackBar
  plcChecked: boolean;


  //displayedVars:[{tcVar:TwincatVariable}, {slider:string}, {new:string}] = [{tcVar:null},{slider:""},{new:""}]

  constructor(tcService:TwincatConnectorService, _snackBar:MatSnackBar) {
    this.tcService = tcService
    this._snackBar = _snackBar
  }

  ngOnInit(): void {
  }

  readPlcNumbers() {
    for(const index in this.varsToRead) {
      this.varsToRead[index].value = 0
    }
    this.varsToWrite[3].value = this.varsToWrite[5].value
    this.tcService.readPlcNumbers(this.varsToRead, (result) => {
      this.varsToRead[7].value = Number(this.varsToRead[7].value.toFixed(3))
      this.varsToRead[8].value = Number(this.varsToRead[8].value.toFixed(3))
      this.plcChecked = (this.varsToRead[9].value != 0)
    })

  }
  writePlcNumbers() {
    this.tcService.writePlcNumbers(this.varsToWrite)
    this.openSnackBar("Variables written, please read again","info")
  }

  booleanSwitch() {
    this.varsToWrite[9].value = this.isChecked? 1 : 0
  }

  openSnackBar(message: string, action: string) {
    this._snackBar.open(message, action, {
      duration: 2000,
    });
  }

}
