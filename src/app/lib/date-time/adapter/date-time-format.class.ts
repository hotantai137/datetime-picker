/**
 * date-time-format.class
 */

import { InjectionToken } from '@angular/core';

export type H2TDateTimeFormats = {
    parseInput: any,
    fullPickerInput: any,
    datePickerInput: any,
    timePickerInput: any,
    monthYearLabel: any,
    dateA11yLabel: any,
    monthYearA11yLabel: any,
};

/** InjectionToken for date time picker that can be used to override default format. */
export const H2T_DATE_TIME_FORMATS = new InjectionToken<H2TDateTimeFormats>('H2T_DATE_TIME_FORMATS');
