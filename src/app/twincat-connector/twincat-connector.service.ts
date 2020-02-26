import { Injectable } from '@angular/core'
import { TwincatClient } from './twincat-client'
import { HttpClient } from '@angular/common/http'
import { DataWriter } from './data-writer'
import { TwincatVariable, TwincatString, TwincatDatatype } from './twincat-interfaces'
import { DataReader } from './data-reader'
import { NGXLogger } from 'ngx-logger'

@Injectable({
  providedIn: 'root'
})
export class TwincatConnectorService {

  //TODO: These would need to be parametrized
  service = "https://192.168.1.133/TcAdsWebService/TcAdsWebService.dll"
  adsNetId = "192.168.1.133.1.1"
  port = 801
  twincat : TwincatClient


  constructor(private http:HttpClient, private logger: NGXLogger){
    console.info('TwincatConnectorService instantiated')
    this.twincat = new TwincatClient(this.http, this.logger)
    this.twincat.service = this.service
    this.twincat.adsNetId = this.adsNetId
    this.twincat.port = this.port
  }

  checkTwincatRunning(callback:Function) {
    this.twincat.readState(callback)
  }


  /**
   * Reads an array of numeric (or boolean) PLC variables. Not applicable for arrays or strings
   *
   * @param {TwincatVariable[]} varsToRead: Variables array. Values will be overwritten after read.
   * @param {Function} readPlcVarsCallback: Callback function (takes TwincatVariable[] as argument)
   * @memberof TwincatConnectorService
   */
  readPlcNumbers(varsToRead:TwincatVariable[], readPlcVarsCallback:Function) {
    this.getVarHandles(varsToRead, (decodedHandlesString) => {
      const handlesReader = new DataReader(decodedHandlesString, this.logger)

      for (const index in varsToRead) {
        if (!this.validatePLCResponse(handlesReader, true)) {
          console.error("Something went awfully wrong! Getting out of here!")
          return
        }
      }

      let varHandles: number[]= []
      let varSizes: number[] = []

      for (const varIdx in varsToRead) {
        let varSize = Math.abs(varsToRead[varIdx].type)
        //Special case for real. size is set to 5 to differentiatw from DWORD. It's a hack but it works...
        if (varSize === TwincatDatatype.real) {varSize = 4}

        let varHandle = handlesReader.readNUMBER(TwincatDatatype.dword)
        varHandles.push(varHandle)
        varSizes.push(varSize)
      }

      this.logger.trace("handles:"+varHandles)
      this.logger.trace("sizes:"+varSizes)

      const symbolValuesWriter = new DataWriter()

      let parameterSize = 0
      for (const index in varHandles) {
        symbolValuesWriter.writeDWORD(0xF005)
        symbolValuesWriter.writeDWORD(varHandles[index])
        symbolValuesWriter.writeDWORD(varSizes[index])
        parameterSize += varSizes[index]
      }

      const indexGroup = String(0xF080)
      const indexOffset = String(varsToRead.length)
      const cbRdLen = String(parameterSize + (varsToRead.length * 4))
      const encodedData = symbolValuesWriter.encodeData()
      this.twincat.readWrite(indexGroup,indexOffset, cbRdLen, encodedData, (decodedValuesString) => {
        const valuesReader = new DataReader(decodedValuesString, this.logger)

        for (const index in varsToRead) {
          if (!this.validatePLCResponse(valuesReader, false)) {
            this.logger.error("Something went awfully wrong! Getting out of here!")
            return
          }
        }

        const resultVars = varsToRead

        for (const varIdx in varsToRead) {
          if ((varsToRead[varIdx].type != TwincatDatatype.real) && (varsToRead[varIdx].type != TwincatDatatype.lreal)) {
            resultVars[varIdx].value = valuesReader.readNUMBER(varsToRead[varIdx].type)
          }
          if (varsToRead[varIdx].type === TwincatDatatype.real) {
            resultVars[varIdx].value = valuesReader.readREAL()
          }
          if (varsToRead[varIdx].type === TwincatDatatype.lreal) {
            resultVars[varIdx].value = valuesReader.readLREAL()
          }
        }
        readPlcVarsCallback(resultVars)
      })
    })
  }


  /**
   * Reads one PLC String. Requires the String's variable name and the length,
   * packed in a TwincatVariable data type
   *
   * @param {TwincatVariable} varToRead: String variable to read, where:
   * @param {TwincatVariable} varToRead.name: Name of the variable,
   * @param {TwincatVariable} varToReadvarToRead.type: TwincatDataType.string,
   * @param {TwincatVariable} varToReadvarToRead.value: Length of the string
   * @param {Function} readPlcStringCallback: callback function
   * @memberof TwincatConnectorService
   */
  readPlcString(varToRead:TwincatVariable, readPlcStringCallback: Function) {
    const vars:TwincatVariable[] = [varToRead]
    this.getVarHandles(vars, (decodedHandlesString) => {
      const handlesReader = new DataReader(decodedHandlesString, this.logger)

      if (!this.validatePLCResponse(handlesReader, true)) {
        this.logger.error("Something went awfully wrong! Getting out of here!")
        return
      }

      const varHandle = handlesReader.readNUMBER(TwincatDatatype.dword)
      const symbolValuesWriter = new DataWriter()

      symbolValuesWriter.writeDWORD(0xF005)
      symbolValuesWriter.writeDWORD(varHandle)
      symbolValuesWriter.writeDWORD(varToRead.value)

      const indexGroup = String(0xF080)
      const indexOffset = "1"
      const cbRdLen = String(varToRead.value + (4))
      const encodedData = symbolValuesWriter.encodeData()
      this.twincat.readWrite(indexGroup,indexOffset, cbRdLen, encodedData, (decodedValuesString) => {
        this.logger.trace(decodedValuesString)
        readPlcStringCallback(decodedValuesString)
      })
    })
  }

  readPlcArray(arrayToRead:TwincatVariable, readPlcArrayCallback: Function) {
    const vars:TwincatVariable[] = [arrayToRead]
    this.getVarHandles(vars, (decodedHandlesString) => {
      const handlesReader = new DataReader(decodedHandlesString, this.logger)

      if (!this.validatePLCResponse(handlesReader, true)) {
        this.logger.error("Something went awfully wrong! Getting out of here!")
        return
      }

      const varHandle = handlesReader.readNUMBER(TwincatDatatype.dword)
      const symbolValuesWriter = new DataWriter()

      symbolValuesWriter.writeDWORD(0xF005)
      symbolValuesWriter.writeDWORD(varHandle)
      symbolValuesWriter.writeDWORD(arrayToRead.value * Math.abs(arrayToRead.type))

      const indexGroup = String(0xF080)
      const indexOffset = "1"
      const cbRdLen = String(arrayToRead.value * Math.abs(arrayToRead.type) + (4))
      const encodedData = symbolValuesWriter.encodeData()
      this.twincat.readWrite(indexGroup,indexOffset, cbRdLen, encodedData, (decodedValuesString) => {
        this.logger.trace(decodedValuesString)
        const valuesReader = new DataReader(decodedValuesString, this.logger)

        if (!this.validatePLCResponse(valuesReader, false)) {
          this.logger.error("Something went awfully wrong! Getting out of here!")
          return
        }

        let result:number[] = []
        for(let i=0; i<arrayToRead.value;i++) {
          if ((arrayToRead.type != TwincatDatatype.real) && (arrayToRead.type != TwincatDatatype.lreal)) {
            result.push(valuesReader.readNUMBER(arrayToRead.type))
          }
          if (arrayToRead.type === TwincatDatatype.real) {
            result.push(valuesReader.readREAL())
          }
          if (arrayToRead.type === TwincatDatatype.lreal) {
            result.push(valuesReader.readLREAL())
          }
        }

        readPlcArrayCallback(result);

      })
    })
  }

  /**
   * Gets the var handles for the PLC variables to be read.
   * (integer values pointing to the PLC memory index where the objects are stored)
   *
   * @private
   * @param {TwincatVariable[]} varsToRead: Array of 1 or more PLC variables to be read
   * @param {Function} varHandlesCallback: callback function
   * @memberof TwincatConnectorService
   */
  private getVarHandles(varsToRead:TwincatVariable[], varHandlesCallback:Function) {
    const varHandleDataWriter = new DataWriter()
    for (const idx in varsToRead) {
      varHandleDataWriter.writeDWORD(0xF003)//0xF003
      varHandleDataWriter.writeDWORD(0)
      varHandleDataWriter.writeDWORD(4)
      varHandleDataWriter.writeDWORD(varsToRead[idx].name.length)
    }
    for (const idx in varsToRead) {
      varHandleDataWriter.writeString(varsToRead[idx].name)
    }
    const indexGroup = String(0xF082)
    const indexOffset = String(varsToRead.length)
    const cbRdLen = String((varsToRead.length * 4) + (varsToRead.length * 8))
    const encodedData = varHandleDataWriter.encodeData()
    this.twincat.readWrite(indexGroup,indexOffset, cbRdLen, encodedData, varHandlesCallback)
  }

  /**
   * Checks the PLC response for errors and trims the header of the response.
   *
   * @private
   * @param {DataReader} reader
   * @param {boolean} areHandles
   * @returns {boolean}
   * @memberof TwincatConnectorService
   */
  private validatePLCResponse(reader: DataReader, areHandles: boolean) : boolean {
    const err = reader.readNUMBER(TwincatDatatype.dword)
    if (areHandles) {
      const ignored = reader.readNUMBER(TwincatDatatype.dword)
    }
    if (err != 0) {
        console.error("Unknown error decoding PLC response.") //TODO: improve error handling
        return false
    } else {
      return true
    }
  }
}
