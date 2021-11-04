/**
 * date-time.module
 */

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { A11yModule } from '@angular/cdk/a11y';
import { OverlayModule } from '@angular/cdk/overlay';
import { FormsModule } from '@angular/forms';
import { H2TDateTimeTriggerDirective } from './date-time-picker-trigger.directive';
import { H2T_DTPICKER_SCROLL_STRATEGY_PROVIDER, H2TDateTimeComponent } from './date-time-picker.component';
import { H2TDateTimeContainerComponent } from './date-time-picker-container.component';
import { H2TDateTimeInputDirective } from './date-time-picker-input.directive';
import { H2TDateTimeIntl } from './date-time-picker-intl.service';
import { H2TMonthViewComponent } from './calendar-month-view.component';
import { H2TCalendarBodyComponent } from './calendar-body.component';
import { H2TYearViewComponent } from './calendar-year-view.component';
import { H2TMultiYearViewComponent } from './calendar-multi-year-view.component';
import { H2TTimerBoxComponent } from './timer-box.component';
import { H2TTimerComponent } from './timer.component';
import { NumberFixedLenPipe } from './numberedFixLen.pipe';
import { H2TCalendarComponent } from './calendar.component';
import { H2TDateTimeInlineComponent } from './date-time-inline.component';
import { H2TDialogModule } from '../dialog/dialog.module';
import { H2TTimePickerComponent } from './time-picker.component';

@NgModule({
    imports: [CommonModule, OverlayModule, FormsModule, H2TDialogModule, A11yModule],
    exports: [
        H2TCalendarComponent,
        H2TTimerComponent,
        H2TDateTimeTriggerDirective,
        H2TDateTimeInputDirective,
        H2TDateTimeComponent,
        H2TDateTimeInlineComponent,
        H2TMultiYearViewComponent,
        H2TYearViewComponent,
        H2TMonthViewComponent,
        H2TTimePickerComponent
    ],
    declarations: [
        H2TDateTimeTriggerDirective,
        H2TDateTimeInputDirective,
        H2TDateTimeComponent,
        H2TDateTimeContainerComponent,
        H2TMultiYearViewComponent,
        H2TYearViewComponent,
        H2TMonthViewComponent,
        H2TTimerComponent,
        H2TTimerBoxComponent,
        H2TCalendarComponent,
        H2TCalendarBodyComponent,
        NumberFixedLenPipe,
        H2TDateTimeInlineComponent,
        H2TTimePickerComponent
    ],
    providers: [
        H2TDateTimeIntl,
        H2T_DTPICKER_SCROLL_STRATEGY_PROVIDER,
    ],
    entryComponents: [
        H2TDateTimeContainerComponent,
    ]
})
export class H2TDateTimeModule {
}
