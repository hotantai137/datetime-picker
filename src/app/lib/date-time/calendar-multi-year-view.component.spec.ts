/**
 * calendar-multi-year-view.component.spec
 */

import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { H2TDateTimeIntl } from './date-time-picker-intl.service';
import { H2TNativeDateTimeModule } from './adapter/native-date-time.module';
import { H2TDateTimeModule } from './date-time.module';
import { Component, DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';
import {
    H2TMultiYearViewComponent,
    YEAR_ROWS,
    YEARS_PER_ROW
} from './calendar-multi-year-view.component';
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
import { H2TYearViewComponent } from './calendar-year-view.component';

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

describe('H2TMultiYearViewComponent', () => {
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [H2TNativeDateTimeModule, H2TDateTimeModule],
            declarations: [
                StandardMultiYearViewComponent,
                MultiYearViewWithDateFilterComponent
            ],
            providers: [H2TDateTimeIntl]
        }).compileComponents();
    }));

    describe('standard multi-years view', () => {
        let fixture: ComponentFixture<StandardMultiYearViewComponent>;
        let testComponent: StandardMultiYearViewComponent;
        let multiYearViewDebugElement: DebugElement;
        let multiYearViewElement: HTMLElement;
        let multiYearViewInstance: H2TMultiYearViewComponent<Date>;

        beforeEach(() => {
            fixture = TestBed.createComponent(StandardMultiYearViewComponent);
            fixture.detectChanges();

            multiYearViewDebugElement = fixture.debugElement.query(
                By.directive(H2TMultiYearViewComponent)
            );
            multiYearViewElement = multiYearViewDebugElement.nativeElement;
            testComponent = fixture.componentInstance;
            multiYearViewInstance = multiYearViewDebugElement.componentInstance;
        });

        it('should have correct number of years', () => {
            let cellEls = multiYearViewElement.querySelectorAll(
                '.h2t-dt-calendar-cell'
            )!;
            expect(cellEls.length).toBe(YEARS_PER_ROW * YEAR_ROWS);
        });

        it('should shows selected year if in same range', () => {
            let selectedElContent = multiYearViewElement.querySelector(
                '.h2t-dt-calendar-cell-selected.h2t-dt-calendar-cell-content'
            )!;
            expect(selectedElContent.innerHTML.trim()).toBe('2020');
        });

        it('should NOT show selected year if in different range', () => {
            testComponent.selected = new Date(2040, JAN, 10);
            fixture.detectChanges();

            let selectedElContent = multiYearViewElement.querySelector(
                '.h2t-calendar-body-selected.h2t-dt-calendar-cell-content'
            );
            expect(selectedElContent).toBeNull();
        });

        it('should fire change event on cell clicked', () => {
            let cellDecember = multiYearViewElement.querySelector(
                '[aria-label="2030"]'
            );
            dispatchMouseEvent(cellDecember, 'click');
            fixture.detectChanges();

            let selectedElContent = multiYearViewElement.querySelector(
                '.h2t-dt-calendar-cell-active .h2t-dt-calendar-cell-content'
            )!;
            expect(selectedElContent.innerHTML.trim()).toBe('2030');
        });

        it('should mark active date', () => {
            let cell2017 = multiYearViewElement.querySelector(
                '[aria-label="2018"]'
            );
            expect((cell2017 as HTMLElement).innerText.trim()).toBe('2018');
            expect(cell2017.classList).toContain('h2t-dt-calendar-cell-active');
        });

        it('should decrement year on left arrow press', () => {
            let calendarBodyEl = multiYearViewElement.querySelector(
                '.h2t-dt-calendar-body'
            );
            dispatchKeyboardEvent(calendarBodyEl, 'keydown', LEFT_ARROW);
            fixture.detectChanges();

            expect(multiYearViewInstance.pickerMoment).toEqual(
                new Date(2017, JAN, 5)
            );

            dispatchKeyboardEvent(calendarBodyEl, 'keydown', LEFT_ARROW);
            fixture.detectChanges();

            expect(multiYearViewInstance.pickerMoment).toEqual(
                new Date(2016, JAN, 5)
            );
        });

        it('should increment year on right arrow press', () => {
            let calendarBodyEl = multiYearViewElement.querySelector(
                '.h2t-dt-calendar-body'
            );
            dispatchKeyboardEvent(calendarBodyEl, 'keydown', RIGHT_ARROW);
            fixture.detectChanges();

            expect(multiYearViewInstance.pickerMoment).toEqual(
                new Date(2019, JAN, 5)
            );

            dispatchKeyboardEvent(calendarBodyEl, 'keydown', RIGHT_ARROW);
            fixture.detectChanges();

            expect(multiYearViewInstance.pickerMoment).toEqual(
                new Date(2020, JAN, 5)
            );
        });

        it('should go up a row on up arrow press', () => {
            let calendarBodyEl = multiYearViewElement.querySelector(
                '.h2t-dt-calendar-body'
            );
            dispatchKeyboardEvent(calendarBodyEl, 'keydown', UP_ARROW);
            fixture.detectChanges();

            expect(multiYearViewInstance.pickerMoment).toEqual(
                new Date(2018 - YEARS_PER_ROW, JAN, 5)
            );

            dispatchKeyboardEvent(calendarBodyEl, 'keydown', UP_ARROW);
            fixture.detectChanges();

            expect(multiYearViewInstance.pickerMoment).toEqual(
                new Date(2018 - YEARS_PER_ROW * 2, JAN, 5)
            );
        });

        it('should go down a row on down arrow press', () => {
            let calendarBodyEl = multiYearViewElement.querySelector(
                '.h2t-dt-calendar-body'
            );
            dispatchKeyboardEvent(calendarBodyEl, 'keydown', DOWN_ARROW);
            fixture.detectChanges();

            expect(multiYearViewInstance.pickerMoment).toEqual(
                new Date(2018 + YEARS_PER_ROW, JAN, 5)
            );

            dispatchKeyboardEvent(calendarBodyEl, 'keydown', DOWN_ARROW);
            fixture.detectChanges();

            expect(multiYearViewInstance.pickerMoment).toEqual(
                new Date(2018 + YEARS_PER_ROW * 2, JAN, 5)
            );
        });

        it('should go to first year in current range on home press', () => {
            let calendarBodyEl = multiYearViewElement.querySelector(
                '.h2t-dt-calendar-body'
            );
            dispatchKeyboardEvent(calendarBodyEl, 'keydown', HOME);
            fixture.detectChanges();

            expect(multiYearViewInstance.pickerMoment).toEqual(
                new Date(2016, JAN, 5)
            );

            dispatchKeyboardEvent(calendarBodyEl, 'keydown', HOME);
            fixture.detectChanges();

            expect(multiYearViewInstance.pickerMoment).toEqual(
                new Date(2016, JAN, 5)
            );
        });

        it('should go to last year in current range on end press', () => {
            let calendarBodyEl = multiYearViewElement.querySelector(
                '.h2t-dt-calendar-body'
            );
            dispatchKeyboardEvent(calendarBodyEl, 'keydown', END);
            fixture.detectChanges();

            expect(multiYearViewInstance.pickerMoment).toEqual(
                new Date(2036, JAN, 5)
            );

            dispatchKeyboardEvent(calendarBodyEl, 'keydown', END);
            fixture.detectChanges();

            expect(multiYearViewInstance.pickerMoment).toEqual(
                new Date(2036, JAN, 5)
            );
        });

        it('should go to same index in previous year range page up press', () => {
            let calendarBodyEl = multiYearViewElement.querySelector(
                '.h2t-dt-calendar-body'
            );
            dispatchKeyboardEvent(calendarBodyEl, 'keydown', PAGE_UP);
            fixture.detectChanges();

            expect(multiYearViewInstance.pickerMoment).toEqual(
                new Date(2018 - YEARS_PER_ROW * YEAR_ROWS, JAN, 5)
            );

            dispatchKeyboardEvent(calendarBodyEl, 'keydown', PAGE_UP);
            fixture.detectChanges();

            expect(multiYearViewInstance.pickerMoment).toEqual(
                new Date(2018 - YEARS_PER_ROW * YEAR_ROWS * 2, JAN, 5)
            );
        });

        it('should go to same index in next year range on page down press', () => {
            let calendarBodyEl = multiYearViewElement.querySelector(
                '.h2t-dt-calendar-body'
            );
            dispatchKeyboardEvent(calendarBodyEl, 'keydown', PAGE_DOWN);
            fixture.detectChanges();

            expect(multiYearViewInstance.pickerMoment).toEqual(
                new Date(2018 + YEARS_PER_ROW * YEAR_ROWS, JAN, 5)
            );

            dispatchKeyboardEvent(calendarBodyEl, 'keydown', PAGE_DOWN);
            fixture.detectChanges();

            expect(multiYearViewInstance.pickerMoment).toEqual(
                new Date(2018 + YEARS_PER_ROW * YEAR_ROWS * 2, JAN, 5)
            );
        });
    });

    describe('multi-years view with date filter', () => {
        let fixture: ComponentFixture<MultiYearViewWithDateFilterComponent>;
        let multiYearViewElement: Element;

        beforeEach(() => {
            fixture = TestBed.createComponent(
                MultiYearViewWithDateFilterComponent
            );
            fixture.detectChanges();

            let multiYearViewDebugElement = fixture.debugElement.query(
                By.directive(H2TMultiYearViewComponent)
            );
            multiYearViewElement = multiYearViewDebugElement.nativeElement;
        });

        it('should disable filtered years', () => {
            let cell2018 = multiYearViewElement.querySelector(
                '[aria-label="2018"]'
            );
            let cell2019 = multiYearViewElement.querySelector(
                '[aria-label="2019"]'
            );
            expect(cell2019.classList).not.toContain(
                'h2t-dt-calendar-cell-disabled'
            );
            expect(cell2018.classList).toContain(
                'h2t-dt-calendar-cell-disabled'
            );
        });
    });
});

@Component({
    template: `
        <h2t-date-time-multi-year-view
                [selected]="selected"
                [(pickerMoment)]="pickerMoment"
                (change)="handleChange($event)"></h2t-date-time-multi-year-view>
    `
})
class StandardMultiYearViewComponent {
    selected = new Date(2020, JAN, 10);
    pickerMoment = new Date(2018, JAN, 5);

    handleChange(date: Date): void {
        this.pickerMoment = new Date(date);
    }
}

@Component({
    template: `
        <h2t-date-time-multi-year-view
                [(pickerMoment)]="pickerMoment"
                [dateFilter]="dateFilter"></h2t-date-time-multi-year-view>
    `
})
class MultiYearViewWithDateFilterComponent {
    pickerMoment = new Date(2018, JAN, 1);
    dateFilter(date: Date) {
        return date.getFullYear() !== 2018;
    }
}
