/**
 * calendar-year-view.component.spec
 */

import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { H2TDateTimeIntl } from './date-time-picker-intl.service';
import { H2TNativeDateTimeModule } from './adapter/native-date-time.module';
import { H2TDateTimeModule } from './date-time.module';
import { Component, DebugElement } from '@angular/core';
import { H2TYearViewComponent } from './calendar-year-view.component';
import { By } from '@angular/platform-browser';
import { dispatchMouseEvent, dispatchKeyboardEvent } from '../../test-helpers';
import {
    DOWN_ARROW,
    END,
    HOME,
    LEFT_ARROW,
    PAGE_DOWN,
    PAGE_UP,
    RIGHT_ARROW,
    UP_ARROW
} from '@angular/cdk/keycodes';
import { H2TMonthViewComponent } from './calendar-month-view.component';

const JAN = 0,
    FEB = 1,
    MAR = 2,
    APR = 3,
    MAY = 4,
    JUN = 5,
    JUL = 6,
    AUG = 7,
    SEP = 8,
    OCT = 9,
    NOV = 10,
    DEC = 11;

describe('H2TYearViewComponent', () => {
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [H2TNativeDateTimeModule, H2TDateTimeModule],
            declarations: [
                StandardYearViewComponent,
                YearViewWithDateFilterComponent
            ],
            providers: [H2TDateTimeIntl]
        }).compileComponents();
    }));

    describe('standard year view', () => {
        let fixture: ComponentFixture<StandardYearViewComponent>;
        let testComponent: StandardYearViewComponent;
        let yearViewDebugElement: DebugElement;
        let yearViewElement: HTMLElement;
        let yearViewInstance: H2TYearViewComponent<Date>;

        beforeEach(() => {
            fixture = TestBed.createComponent(StandardYearViewComponent);
            fixture.detectChanges();

            yearViewDebugElement = fixture.debugElement.query(
                By.directive(H2TYearViewComponent)
            );
            yearViewElement = yearViewDebugElement.nativeElement;
            testComponent = fixture.componentInstance;
            yearViewInstance = yearViewDebugElement.componentInstance;
        });

        it('should have 12 months', () => {
            let cellEls = yearViewElement.querySelectorAll(
                '.h2t-dt-calendar-cell'
            )!;
            expect(cellEls.length).toBe(12);
        });

        it('should show selected month if in same year', () => {
            let selectedElContent = yearViewElement.querySelector(
                '.h2t-dt-calendar-cell-selected.h2t-dt-calendar-cell-content'
            )!;
            expect(selectedElContent.innerHTML.trim()).toBe('Jan');
        });

        it('should NOT show selected month if in different year', () => {
            testComponent.selected = new Date(2017, JAN, 10);
            fixture.detectChanges();

            let selectedElContent = yearViewElement.querySelector(
                '.h2t-calendar-body-selected.h2t-dt-calendar-cell-content'
            );
            expect(selectedElContent).toBeNull();
        });

        it('should fire change event on cell clicked', () => {
            let cellDecember = yearViewElement.querySelector(
                '[aria-label="December 2018"]'
            );
            dispatchMouseEvent(cellDecember, 'click');
            fixture.detectChanges();

            let selectedElContent = yearViewElement.querySelector(
                '.h2t-dt-calendar-cell-active .h2t-dt-calendar-cell-content'
            )!;
            expect(selectedElContent.innerHTML.trim()).toBe('Dec');
        });

        it('should mark active date', () => {
            let cellDecember = yearViewElement.querySelector(
                '[aria-label="January 2018"]'
            );
            expect((cellDecember as HTMLElement).innerText.trim()).toBe('Jan');
            expect(cellDecember.classList).toContain(
                'h2t-dt-calendar-cell-active'
            );
        });

        it('should allow selection of month with less days than current active date', () => {
            testComponent.pickerMoment = new Date(2017, JUL, 31);
            fixture.detectChanges();

            let cellJune = yearViewElement.querySelector(
                '[aria-label="June 2017"]'
            );
            dispatchMouseEvent(cellJune, 'click');
            fixture.detectChanges();

            expect(testComponent.pickerMoment).toEqual(new Date(2017, JUN, 30));
        });

        it('should decrement month on left arrow press', () => {
            let calendarBodyEl = yearViewElement.querySelector(
                '.h2t-dt-calendar-body'
            );
            dispatchKeyboardEvent(calendarBodyEl, 'keydown', LEFT_ARROW);
            fixture.detectChanges();

            expect(yearViewInstance.pickerMoment).toEqual(
                new Date(2017, DEC, 5)
            );

            dispatchKeyboardEvent(calendarBodyEl, 'keydown', LEFT_ARROW);
            fixture.detectChanges();

            expect(yearViewInstance.pickerMoment).toEqual(
                new Date(2017, NOV, 5)
            );
        });

        it('should increment month on right arrow press', () => {
            let calendarBodyEl = yearViewElement.querySelector(
                '.h2t-dt-calendar-body'
            );
            dispatchKeyboardEvent(calendarBodyEl, 'keydown', RIGHT_ARROW);
            fixture.detectChanges();

            expect(yearViewInstance.pickerMoment).toEqual(
                new Date(2018, FEB, 5)
            );

            dispatchKeyboardEvent(calendarBodyEl, 'keydown', RIGHT_ARROW);
            fixture.detectChanges();

            expect(yearViewInstance.pickerMoment).toEqual(
                new Date(2018, MAR, 5)
            );
        });

        it('should go up a row on up arrow press', () => {
            let calendarBodyEl = yearViewElement.querySelector(
                '.h2t-dt-calendar-body'
            );
            dispatchKeyboardEvent(calendarBodyEl, 'keydown', UP_ARROW);
            fixture.detectChanges();

            expect(yearViewInstance.pickerMoment).toEqual(
                new Date(2017, OCT, 5)
            );

            yearViewInstance.pickerMoment = new Date(2018, JUL, 1);
            fixture.detectChanges();

            dispatchKeyboardEvent(calendarBodyEl, 'keydown', UP_ARROW);
            fixture.detectChanges();

            expect(yearViewInstance.pickerMoment).toEqual(
                new Date(2018, APR, 1)
            );

            yearViewInstance.pickerMoment = new Date(2018, DEC, 10);
            fixture.detectChanges();

            dispatchKeyboardEvent(calendarBodyEl, 'keydown', UP_ARROW);
            fixture.detectChanges();

            expect(yearViewInstance.pickerMoment).toEqual(
                new Date(2018, SEP, 10)
            );
        });

        it('should go down a row on down arrow press', () => {
            let calendarBodyEl = yearViewElement.querySelector(
                '.h2t-dt-calendar-body'
            );
            dispatchKeyboardEvent(calendarBodyEl, 'keydown', DOWN_ARROW);
            fixture.detectChanges();

            expect(yearViewInstance.pickerMoment).toEqual(
                new Date(2018, APR, 5)
            );

            yearViewInstance.pickerMoment = new Date(2018, JUN, 1);
            fixture.detectChanges();

            dispatchKeyboardEvent(calendarBodyEl, 'keydown', DOWN_ARROW);
            fixture.detectChanges();

            expect(yearViewInstance.pickerMoment).toEqual(
                new Date(2018, SEP, 1)
            );

            yearViewInstance.pickerMoment = new Date(2018, SEP, 30);
            fixture.detectChanges();

            dispatchKeyboardEvent(calendarBodyEl, 'keydown', DOWN_ARROW);
            fixture.detectChanges();

            expect(yearViewInstance.pickerMoment).toEqual(
                new Date(2018, DEC, 30)
            );
        });

        it('should go to first month of the year on home press', () => {
            yearViewInstance.pickerMoment = new Date(2018, SEP, 30);
            fixture.detectChanges();

            let calendarBodyEl = yearViewElement.querySelector(
                '.h2t-dt-calendar-body'
            );
            dispatchKeyboardEvent(calendarBodyEl, 'keydown', HOME);
            fixture.detectChanges();

            expect(yearViewInstance.pickerMoment).toEqual(
                new Date(2018, JAN, 30)
            );

            dispatchKeyboardEvent(calendarBodyEl, 'keydown', HOME);
            fixture.detectChanges();

            expect(yearViewInstance.pickerMoment).toEqual(
                new Date(2018, JAN, 30)
            );
        });

        it('should go to last month of the year on end press', () => {
            yearViewInstance.pickerMoment = new Date(2018, OCT, 31);
            fixture.detectChanges();

            let calendarBodyEl = yearViewElement.querySelector(
                '.h2t-dt-calendar-body'
            );
            dispatchKeyboardEvent(calendarBodyEl, 'keydown', END);
            fixture.detectChanges();

            expect(yearViewInstance.pickerMoment).toEqual(
                new Date(2018, DEC, 31)
            );

            dispatchKeyboardEvent(calendarBodyEl, 'keydown', END);
            fixture.detectChanges();

            expect(yearViewInstance.pickerMoment).toEqual(
                new Date(2018, DEC, 31)
            );
        });

        it('should go back one year on page up press', () => {
            yearViewInstance.pickerMoment = new Date(2016, FEB, 29);
            fixture.detectChanges();

            let calendarBodyEl = yearViewElement.querySelector(
                '.h2t-dt-calendar-body'
            );
            dispatchKeyboardEvent(calendarBodyEl, 'keydown', PAGE_UP);
            fixture.detectChanges();

            expect(yearViewInstance.pickerMoment).toEqual(
                new Date(2015, FEB, 28)
            );

            dispatchKeyboardEvent(calendarBodyEl, 'keydown', PAGE_UP);
            fixture.detectChanges();

            expect(yearViewInstance.pickerMoment).toEqual(
                new Date(2014, FEB, 28)
            );
        });

        it('should go forward one year on page down press', () => {
            yearViewInstance.pickerMoment = new Date(2016, FEB, 29);
            fixture.detectChanges();

            let calendarBodyEl = yearViewElement.querySelector(
                '.h2t-dt-calendar-body'
            );
            dispatchKeyboardEvent(calendarBodyEl, 'keydown', PAGE_DOWN);
            fixture.detectChanges();

            expect(yearViewInstance.pickerMoment).toEqual(
                new Date(2017, FEB, 28)
            );

            dispatchKeyboardEvent(calendarBodyEl, 'keydown', PAGE_DOWN);
            fixture.detectChanges();

            expect(yearViewInstance.pickerMoment).toEqual(
                new Date(2018, FEB, 28)
            );
        });
    });

    describe('year view with date filter', () => {
        let fixture: ComponentFixture<YearViewWithDateFilterComponent>;
        let yearViewNativeElement: Element;

        beforeEach(() => {
            fixture = TestBed.createComponent(YearViewWithDateFilterComponent);
            fixture.detectChanges();

            let yearViewDebugElement = fixture.debugElement.query(
                By.directive(H2TYearViewComponent)
            );
            yearViewNativeElement = yearViewDebugElement.nativeElement;
        });

        it('should disable filtered months', () => {
            let cellJan = yearViewNativeElement.querySelector(
                '[aria-label="January 2018"]'
            );
            let cellFeb = yearViewNativeElement.querySelector(
                '[aria-label="February 2018"]'
            );
            expect(cellJan.classList).not.toContain(
                'h2t-dt-calendar-cell-disabled'
            );
            expect(cellFeb.classList).toContain(
                'h2t-dt-calendar-cell-disabled'
            );
        });
    });
});

@Component({
    template: `
        <h2t-date-time-year-view
                [selected]="selected"
                [(pickerMoment)]="pickerMoment"
                (change)="handleChange($event)"></h2t-date-time-year-view>
    `
})
class StandardYearViewComponent {
    selected = new Date(2018, JAN, 10);
    pickerMoment = new Date(2018, JAN, 5);

    handleChange(date: Date): void {
        this.pickerMoment = new Date(date);
    }
}

@Component({
    template: `
        <h2t-date-time-year-view
                [(pickerMoment)]="pickerMoment"
                [dateFilter]="dateFilter"></h2t-date-time-year-view>
    `
})
class YearViewWithDateFilterComponent {
    pickerMoment = new Date(2018, JAN, 1);
    dateFilter(date: Date) {
        if (date.getMonth() == FEB) {
            return false;
        }
        return true;
    }
}
