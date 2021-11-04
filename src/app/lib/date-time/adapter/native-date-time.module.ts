/**
 * native-date-time.module
 */

import { NgModule } from '@angular/core';
import { PlatformModule } from '@angular/cdk/platform';
import { DateTimeAdapter } from './date-time-adapter.class';
import { NativeDateTimeAdapter } from './native-date-time-adapter.class';
import { H2T_DATE_TIME_FORMATS } from './date-time-format.class';
import { H2T_NATIVE_DATE_TIME_FORMATS } from './native-date-time-format.class';

@NgModule({
    imports: [PlatformModule],
    providers: [
        {provide: DateTimeAdapter, useClass: NativeDateTimeAdapter},
    ],
})
export class NativeDateTimeModule {
}

@NgModule({
    imports: [NativeDateTimeModule],
    providers: [{provide: H2T_DATE_TIME_FORMATS, useValue: H2T_NATIVE_DATE_TIME_FORMATS}],
})
export class H2TNativeDateTimeModule {
}
