import { Component, OnInit, Input } from '@angular/core';
import { TwincatVariable, TwincatDatatype } from '../twincat-connector/twincat-interfaces';
import { TwincatConnectorService } from '../twincat-connector/twincat-connector.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-read-write-arrays',
  templateUrl: './read-write-arrays.component.html',
  styleUrls: ['./read-write-arrays.component.css']
})
export class ReadWriteArraysComponent implements OnInit {

  @Input() tcService: TwincatConnectorService

  arrayToRead1:TwincatVariable = {name:"MAIN.SINTARRAY", type:TwincatDatatype.sint, value:5}
  arrayToRead2:TwincatVariable = {name:"MAIN.INTARRAY", type:TwincatDatatype.int, value:5}
  arrayToRead3:TwincatVariable = {name:"MAIN.DINTARRAY", type:TwincatDatatype.dint, value:5}
  arrayToRead4:TwincatVariable = {name:"MAIN.UINTARRAY", type:TwincatDatatype.uint, value:5}
  arrayToRead5:TwincatVariable = {name:"MAIN.BYTEARRAY", type:TwincatDatatype.byte, value:5}
  arrayToRead6:TwincatVariable = {name:"MAIN.WORDARRAY", type:TwincatDatatype.word, value:5}
  arrayToRead7:TwincatVariable = {name:"MAIN.DWORDARRAY", type:TwincatDatatype.dword, value:5}
  arrayToRead8:TwincatVariable = {name:"MAIN.REALARRAY", type:TwincatDatatype.real, value:5}
  arrayToRead9:TwincatVariable = {name:"MAIN.LREALARRAY", type:TwincatDatatype.lreal, value:5}
  arrayToRead10:TwincatVariable = {name:"MAIN.BOOLARRAY", type:TwincatDatatype.bool, value:5}


  allArrays = [
    this.arrayToRead1, this.arrayToRead2, this.arrayToRead3, this.arrayToRead4, this.arrayToRead5,
    this.arrayToRead6, this.arrayToRead7, this.arrayToRead8, this.arrayToRead9, this.arrayToRead10,
  ]

  valuesToRead:[number[]] = [[]]
  valuesToWrite:[number[]] = [[]]

  displayedColumns = ["plc","new"]
  _snackBar: MatSnackBar;

  constructor(tcService:TwincatConnectorService, _snackBar:MatSnackBar) {
    this.tcService = tcService
    this._snackBar = _snackBar
    this.randomize()
    this.valuesToRead = [[]]
    for (let i=0;i<10;i++) {
      let numberArr:number[] = []
      for (let j=0;j<5;j++) {
        numberArr.push(0)
      }
      this.valuesToRead[i] = numberArr
    }
  }

  ngOnInit(): void {

  }

  randomize() {
    this.valuesToWrite = [[]]
    for (let i=0;i<10;i++) {
      let numberArr:number[] = []
      for (let j=0;j<5;j++) {
        let randomNumber = 0
        switch(i){
          case 0: //SINT
            randomNumber = Math.round((Math.random() * 255) - 128)
            break
          case 1: //INT
            randomNumber = Math.round((Math.random() * 65535) - 32768)
            break
          case 2: //DINT
            randomNumber = Math.round((Math.random() * 255) - 128)
            break
          case 3: //UINT / WORD
            randomNumber = Math.round(Math.random() * 65535)
            break
          case 4: //BYTE
            randomNumber = Math.round(Math.random() * 255)
            break
          case 5: //UINT / WORD
            randomNumber = Math.round(Math.random() * 65535)
            break
          case 6: //DWORD
            randomNumber = Math.round(Math.random() * 65535)
            break
          case 7: //REAL
            randomNumber = (Math.random() * 100000)
            break
          case 8: //LREAL
            randomNumber = (Math.random() * 100000)
            break
          case 9: //Bool
            randomNumber = Math.round(Math.random())
            break
          }
        numberArr.push(randomNumber)
      }
      this.valuesToWrite[i] = numberArr
    }
    this.openSnackBar("New numbers generated", "INFO")
  }

  readAllArrays() {
    for(const index in this.allArrays) {
      this.tcService.readPlcArray(this.allArrays[index], (arrayResult:number[]) => {
        this.valuesToRead[index] = arrayResult
      })
    }
  }

  writeAllArrays() {
    for(const index in this.allArrays) {
      this.tcService.updatePlcArray(this.allArrays[index], this.valuesToWrite[index])
    }
    this.openSnackBar("Arrays written, please read them again", "INFO")
  }

  openSnackBar(message: string, action: string) {
    this._snackBar.open(message, action, {
      duration: 2000,
    });
  }
}
