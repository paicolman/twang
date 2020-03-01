import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { AppComponent } from './app.component';
import { LoggerModule, NgxLoggerLevel } from 'ngx-logger';
import {FormsModule} from '@angular/forms';
//import { ButtonsModule } from 'ngx-bootstrap'
import { MatToolbarModule } from '@angular/material/toolbar'
import { MatTabsModule } from '@angular/material/tabs';
import {MatButtonModule} from '@angular/material/button'
import {MatTableModule} from '@angular/material/table'
import {MatSliderModule} from '@angular/material/slider'
import {MatSlideToggleModule} from '@angular/material/slide-toggle'
import {MatSnackBarModule} from '@angular/material/snack-bar'
import {MatCardModule} from '@angular/material/card'
import {MatFormFieldModule} from '@angular/material/form-field'
import {MatExpansionModule} from '@angular/material/expansion'
import {MatGridListModule} from '@angular/material/grid-list'

import { ReadWriteVariablesComponent } from './read-write-variables/read-write-variables.component';
import { ReadWriteStringComponent } from './read-write-string/read-write-string.component';
import { ReadWriteArraysComponent } from './read-write-arrays/read-write-arrays.component'
@NgModule({
  declarations: [
    AppComponent,
    ReadWriteVariablesComponent,
    ReadWriteStringComponent,
    ReadWriteArraysComponent
  ],
  imports: [
    //Materials
    FormsModule,
    MatToolbarModule,
    MatTabsModule,
    MatTableModule,
    MatButtonModule,
    MatSliderModule,
    MatSlideToggleModule,
    MatSnackBarModule,
    MatCardModule,
    MatFormFieldModule,
    MatExpansionModule,
    MatGridListModule,
    //others
    BrowserAnimationsModule,
    BrowserModule,
    HttpClientModule,
    LoggerModule.forRoot({
      level: NgxLoggerLevel.TRACE,
      //serverLoggingUrl: '/api/logs',serverLogLevel: NgxLoggerLevel.DEBUG
    })
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
