import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { AppComponent } from './app.component';
import { LoggerModule, NgxLoggerLevel } from 'ngx-logger';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [BrowserModule, HttpClientModule,
            LoggerModule.forRoot({level: NgxLoggerLevel.TRACE,
                                   //serverLoggingUrl: '/api/logs',serverLogLevel: NgxLoggerLevel.DEBUG
            })],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
