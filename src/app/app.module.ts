import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import { DataPickerModule } from './lib/date-time/ng-data-picker/data-picker.module';
import { H2TDateTimeModule } from './lib/date-time/date-time.module';
import { MatDialogModule } from '@angular/material/dialog';
import { DlgTimePickerMobileComponent } from './lib/date-time/dlg-time-picker-mobile/dlg-time-picker-mobile.component';
import { H2TNativeDateTimeModule } from './lib/date-time/adapter/native-date-time.module';
@NgModule({
  declarations: [
    AppComponent,
    DlgTimePickerMobileComponent
  ],
  imports: [
    BrowserModule, BrowserAnimationsModule, FormsModule,
    AppRoutingModule,
    H2TDateTimeModule,
    H2TNativeDateTimeModule,
    DataPickerModule,
    MatDialogModule
  ],
  providers: [],
  bootstrap: [AppComponent],
  entryComponents: [DlgTimePickerMobileComponent],
})
export class AppModule { }
