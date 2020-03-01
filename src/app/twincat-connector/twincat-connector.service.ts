import { Injectable } from '@angular/core'
import { TwincatClient, TwincatErrorHanlder } from './twincat-client'
import { HttpClient } from '@angular/common/http'
import { DataWriter } from './data-writer'
import { TwincatVariable, TwincatDatatype, ADSERROR } from './twincat-interfaces'
import { DataReader } from './data-reader'
import { NGXLogger } from 'ngx-logger'

@Injectable({
  providedIn: 'root'
})
export class TwincatConnectorService implements TwincatErrorHanlder {

  delegate: TwincatConnectorDelegate;

  //TODO: These would need to be parametrized
  service = "https://192.168.1.133/TcAdsWebService/TcAdsWebService.dll"
  adsNetId = "192.168.1.133.1.1"
  port = 801

  twincat : TwincatClient
  errCode = 0
  errMsg = "No Errors"
  errorCallback:Function


  constructor(private http:HttpClient, private logger: NGXLogger){
    this.twincat = new TwincatClient(this.http, this.logger)
    this.twincat.service = this.service
    this.twincat.adsNetId = this.adsNetId
    this.twincat.port = this.port
    this.twincat.errorHandler = this
    //this.errorCallback = errorCallback
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
    this.logger.debug("TwincatConnectorService.readPlcNumbers("+varsToRead.length+" variables)")
    //Check for no strings
    for(const index in varsToRead) {
      if (varsToRead[index].type === TwincatDatatype.string) {
        this.logger.error("Tried to read strings with readPlcNumbers - Action not allowed")
        this.delegate.errorCallback(88, "String variables not allowed with readPlcNumbers method")
        return
      }
    }

    this.getVarHandles(varsToRead, (decodedHandlesString) => {
      const handlesReader = new DataReader(decodedHandlesString, this.logger)

      for (const index in varsToRead) {
        if (!this.validatePLCResponse(handlesReader, true)) {
          console.error("Something went awfully wrong! Getting out of here!")
          this.delegate.errorCallback(this.errCode, this.errMsg)
        }
      }

      let varHandles: number[]= []
      let varSizes: number[] = []

      for (const varIdx in varsToRead) {
        let varSize = Math.abs(varsToRead[varIdx].type)
        //Special case for real. size is set to 5 to differentiatw from DWORD. It's a hack but it works...
        if (varSize === TwincatDatatype.real) {varSize = 4}
        if (varSize === TwincatDatatype.bool) {varSize = 1}

        let varHandle = handlesReader.readNUMBER(TwincatDatatype.dword)
        varHandles.push(varHandle)
        varSizes.push(varSize)
      }

      this.logger.trace("handles:"+varHandles)
      this.logger.trace("sizes:"+varSizes)

      const symbolValuesWriter = new DataWriter(this.logger)

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
            this.delegate.errorCallback(this.errCode, this.errMsg)
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
    this.logger.debug("TwincatConnectorService.readPlcString("+varToRead.name+", length:"+varToRead.value+")")
    const vars:TwincatVariable[] = [varToRead]
    this.getVarHandles(vars, (decodedHandlesString) => {
      const handlesReader = new DataReader(decodedHandlesString, this.logger)

      if (!this.validatePLCResponse(handlesReader, true)) {
        this.logger.error("Something went awfully wrong! Getting out of here!")
        this.delegate.errorCallback(this.errCode, this.errMsg)
      }

      const varHandle = handlesReader.readNUMBER(TwincatDatatype.dword)
      const symbolValuesWriter = new DataWriter(this.logger)

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

  /**
   * Reads a PLC Array of any numeric type (no strings)
   *
   * @param {TwincatVariable} arrayToRead: Name, type and length of the array
   * @param {Function} readPlcArrayCallback callback
   * @memberof TwincatConnectorService
   */
  readPlcArray(arrayToRead:TwincatVariable, readPlcArrayCallback: Function) {
    this.logger.debug("TwincatConnectorService.readPlcArray("+arrayToRead.name+", type: "+arrayToRead.type+", length:"+arrayToRead.type+")")

    if (arrayToRead.type === TwincatDatatype.string) {
      this.logger.error("Tried to read strings with readPlcArray - Action not allowed")
      this.delegate.errorCallback(88, "String variables not allowed with readPlcArray method")
      return
    }
    const vars:TwincatVariable[] = [arrayToRead]
    this.getVarHandles(vars, (decodedHandlesString) => {
      const handlesReader = new DataReader(decodedHandlesString, this.logger)

      if (!this.validatePLCResponse(handlesReader, true)) {
        this.logger.error("Something went wrong! Getting out of here!")
        //this.errorCallback(this.errCode, this.errMsg)
      }

      const varHandle = handlesReader.readNUMBER(TwincatDatatype.dword)
      const symbolValuesWriter = new DataWriter(this.logger)

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
          this.delegate.errorCallback(this.errCode, this.errMsg)
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
   * Writes Data to a group of variables of dyfferent types
   *
   * @param {TwincatVariable[]} varsToWrite: Variables with names, types and values to be written
   * @memberof TwincatConnectorService
   */
  writePlcNumbers(varsToWrite:TwincatVariable[]) {
    this.logger.debug("TwincatConnectorService.writePlcNumbers("+varsToWrite.length+" variables)")
    //Check for no strings
    for(const index in varsToWrite) {
      if (varsToWrite[index].type === TwincatDatatype.string) {
        this.logger.error("Tried to write strings with writePlcNumbers - Action not allowed")
        this.delegate.errorCallback(88, "String variables not allowed with writePlcNumbers method")
        return
      }
    }

    this.getVarHandles(varsToWrite, (decodedHandlesString:string) => {
      const handlesReader = new DataReader(decodedHandlesString, this.logger)
      for (const index in varsToWrite) {
        if (!this.validatePLCResponse(handlesReader, true)) {
          console.error("Something went awfully wrong! Getting out of here!")
          this.delegate.errorCallback(this.errCode, this.errMsg)
        }
      }

      let varHandles: number[]= []
      let varSizes: number[] = []

      for (const varIdx in varsToWrite) {
        let varSize = Math.abs(varsToWrite[varIdx].type)
        //Special case for real. size is set to 5 to differentiatw from DWORD. It's a hack but it works...
        if (varSize === TwincatDatatype.real) {varSize = 4}
        if (varSize === TwincatDatatype.bool) {varSize = 1}

        let varHandle = handlesReader.readNUMBER(TwincatDatatype.dword)
        varHandles.push(varHandle)
        varSizes.push(varSize)
      }

      this.logger.trace("handles:"+varHandles)
      this.logger.trace("sizes:"+varSizes)

      const symbolValuesWriter = new DataWriter(this.logger)

      let parameterSize = 0
      for (const index in varHandles) {
        symbolValuesWriter.writeDWORD(0xF005)
        symbolValuesWriter.writeDWORD(varHandles[index])
        symbolValuesWriter.writeDWORD(varSizes[index])
        parameterSize += Math.abs(varSizes[index])
      }

      for (const index in varsToWrite) {
        symbolValuesWriter.writeANYTHING(varsToWrite[index])
      }

      const indexGroup = String(0xF081)
      const indexOffset = String(varsToWrite.length)
      const cbRdLen = String(parameterSize + (varsToWrite.length * 4))
      const encodedData = symbolValuesWriter.encodeData()
      this.twincat.readWrite(indexGroup,indexOffset, cbRdLen, encodedData, (decodedValuesString) => {
        const valuesReader = new DataReader(decodedValuesString, this.logger)

        for (const index in varsToWrite) {
          if (!this.validatePLCResponse(valuesReader, false)) {
            this.logger.error("Something went awfully wrong! Getting out of here!")
            this.delegate.errorCallback(this.errCode, this.errMsg)
          }
        }
        this.logger.trace(decodedValuesString)
      });
    });
  }

  /**
   * Writes a new value to a string variable of a defined size. It will trim the value
   * to be written to match the string variable size, or fill in with space if it is smaller.
   *
   * @param {TwincatVariable} varToWrite: PLC string variable, containing name, type(which must be .string) and length
   * @param {string} stringValue: new text value to be written
   * @memberof TwincatConnectorService
   */
  writePlcString(varToWrite:TwincatVariable, stringValue:string) {
    this.logger.debug("TwincatConnectorService.writePlcString("+varToWrite.name+", value:"+stringValue+")")
    const vars:TwincatVariable[] = [varToWrite]
    this.getVarHandles(vars, (decodedHandlesString) => {
      const handlesReader = new DataReader(decodedHandlesString, this.logger)

      if (!this.validatePLCResponse(handlesReader, true)) {
        this.logger.error("Something went awfully wrong! Getting out of here!")
        this.delegate.errorCallback(this.errCode, this.errMsg)
      }

      const varHandle = handlesReader.readNUMBER(TwincatDatatype.dword)
      const symbolValuesWriter = new DataWriter(this.logger)

      symbolValuesWriter.writeDWORD(0xF005)
      symbolValuesWriter.writeDWORD(varHandle)
      symbolValuesWriter.writeDWORD(varToWrite.value)

      if(stringValue.length > varToWrite.value) {
        stringValue = stringValue.substr(0, varToWrite.value)
      } else {
        while(stringValue.length < varToWrite.value) {
          stringValue += " "
        }
      }

      this.logger.trace("String:"+stringValue+" - length:"+stringValue.length)

      symbolValuesWriter.writeString(stringValue)

      const indexGroup = String(0xF081)
      const indexOffset = "1"
      const cbRdLen = String(varToWrite.value + (4))
      const encodedData = symbolValuesWriter.encodeData()
      this.twincat.readWrite(indexGroup,indexOffset, cbRdLen, encodedData, (decodedValuesString) => {
        this.logger.trace(decodedValuesString)
      })
    })
  }

  updatePlcArray(arrayToWrite:TwincatVariable, values:number[]) {
    this.logger.debug("TwincatConnectorService.updtaePlcArray("+arrayToWrite.name+", type: "+arrayToWrite.type+", length:"+arrayToWrite.type+")")

    if (arrayToWrite.type === TwincatDatatype.string) {
      this.logger.error("Tried to write string array with updatePlcArray - Action not allowed")
      this.delegate.errorCallback(88, "String arrays not allowed with updatePlcArray method")
      return
    }
    const vars:TwincatVariable[] = [arrayToWrite]
    this.getVarHandles(vars, (decodedHandlesString) => {
      const handlesReader = new DataReader(decodedHandlesString, this.logger)

      if (!this.validatePLCResponse(handlesReader, true)) {
        this.logger.error("Something went wrong! Getting out of here!")
        //this.errorCallback(this.errCode, this.errMsg)
      }

      const varHandle = handlesReader.readNUMBER(TwincatDatatype.dword)
      const symbolValuesWriter = new DataWriter(this.logger)

      let size = Math.abs(arrayToWrite.type)
      if (size == TwincatDatatype.bool) {size = 1}
      if (size == TwincatDatatype.real) {size = 4}

      symbolValuesWriter.writeDWORD(0xF005)
      symbolValuesWriter.writeDWORD(varHandle)
      symbolValuesWriter.writeDWORD(arrayToWrite.value * size)

      for (const index in values) {
        const tempVar:TwincatVariable = {name: arrayToWrite.name, type: arrayToWrite.type, value: values[index]}
        symbolValuesWriter.writeANYTHING(tempVar)
      }

      const indexGroup = String(0xF081)
      const indexOffset = "1"
      const cbRdLen = String(arrayToWrite.value * Math.abs(arrayToWrite.type) + (4))
      const encodedData = symbolValuesWriter.encodeData()
      this.twincat.readWrite(indexGroup,indexOffset, cbRdLen, encodedData, (decodedValuesString) => {
        this.logger.trace(decodedValuesString)
      })
    })
  }

  /**************************************
  * Private Methods
  **************************************/

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
    this.logger.trace("TwincatConnectorService.getVarHandles("+varsToRead.length+" variables)")
    const varHandleDataWriter = new DataWriter(this.logger)
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
    this.logger.trace("TwincatConnectorService.validatePLCResponse(handles: "+areHandles+")")
    const err = reader.readNUMBER(TwincatDatatype.dword)
    if (areHandles) {
      const ignored = reader.readNUMBER(TwincatDatatype.dword)
    }
    if (err != 0) {
      this.errCode = -1
      this.errMsg = "Unknown error in Plc response"
        if (ADSERROR[err] != undefined) {
          this.errCode = err;
          this.errMsg = ADSERROR[err]
        }
        this.logger.error("!! Error decoding PLC response !!")
        this.logger.error(this.errMsg);
        this.logger.error("Error code:"+ this.errCode);
    } else {
      return true
    }
  }

  //Error handler delegate functions
  httpTimeoutError(): void {
    this.delegate.errorCallback(408, "Timeout during Http request")
  }

  decodingError(msg: string): void {
    this.delegate.errorCallback(600, msg)
  }


}

export interface TwincatConnectorDelegate {
  errorCallback(errCode:number, errMsg: string): void
}
