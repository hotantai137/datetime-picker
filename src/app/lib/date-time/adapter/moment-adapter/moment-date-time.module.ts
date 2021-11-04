/**
 * moment-date-time.module
 */

import { NgModule } from '@angular/core';
import { MomentDateTimeAdapter, H2T_MOMENT_DATE_TIME_ADAPTER_OPTIONS } from './moment-date-time-adapter.class';
import { H2T_MOMENT_DATE_TIME_FORMATS } from './moment-date-time-format.class';
import { DateTimeAdapter, H2T_DATE_TIME_LOCALE } from '../date-time-adapter.class';
import { H2T_DATE_TIME_FORMATS } from '../date-time-format.class';
// import { DateTimeAdapter, H2T_DATE_TIME_FORMATS, H2T_DATE_TIME_LOCALE_PROVIDER } from 'ng-pick-datetime';

@NgModule({
    providers: [
        {
            provide: DateTimeAdapter,
            useClass: MomentDateTimeAdapter,
            deps: [H2T_DATE_TIME_LOCALE, H2T_MOMENT_DATE_TIME_ADAPTER_OPTIONS]
        },
    ],
})
export class MomentDateTimeModule {
}

@NgModule({
    imports: [MomentDateTimeModule],
    providers: [{provide: H2T_DATE_TIME_FORMATS, useValue: H2T_MOMENT_DATE_TIME_FORMATS}],
})
export class H2TMomentDateTimeModule {
}
