/**
 * date-time-inline.component
 */

import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component, EventEmitter,
    forwardRef,
    Inject,
    Input,
    OnInit,
    Optional,
    Output,
    ViewChild
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { coerceBooleanProperty } from '@angular/cdk/coercion';
import {
    DisplayMode,
    H2TDateTime,
    PickerMode,
    PickerType,
    SelectMode
} from './date-time.class';
import { DateTimeAdapter } from './adapter/date-time-adapter.class';
import {
    H2T_DATE_TIME_FORMATS,
    H2TDateTimeFormats
} from './adapter/date-time-format.class';
import { H2TDateTimeContainerComponent } from './date-time-picker-container.component';

export const H2T_DATETIME_VALUE_ACCESSOR: any = {
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => H2TDateTimeInlineComponent),
    multi: true
};

@Component({
    selector: 'h2t-date-time-inline',
    templateUrl: './date-time-inline.component.html',
    styleUrls: ['./date-time-inline.component.scss'],
    host: {
        '[class.h2t-dt-inline]': 'h2tDTInlineClass'
    },
    changeDetection: ChangeDetectionStrategy.OnPush,
    preserveWhitespaces: false,
    providers: [H2T_DATETIME_VALUE_ACCESSOR]
})
export class H2TDateTimeInlineComponent<T> extends H2TDateTime<T>
    implements OnInit, ControlValueAccessor {
    @ViewChild(H2TDateTimeContainerComponent, { static: true })
    container: H2TDateTimeContainerComponent<T>;

    /**
     * Set the type of the dateTime picker
     *      'both' -- show both calendar and timer
     *      'calendar' -- show only calendar
     *      'timer' -- show only timer
     */
    private _pickerType: PickerType = 'both';
    @Input()
    get pickerType(): PickerType {
        return this._pickerType;
    }

    set pickerType(val: PickerType) {
        if (val !== this._pickerType) {
            this._pickerType = val;
        }
    }

    private _disabled = false;
    @Input()
    get disabled(): boolean {
        return !!this._disabled;
    }

    set disabled(value: boolean) {
        this._disabled = coerceBooleanProperty(value);
    }

    private _selectMode: SelectMode = 'single';
    @Input()
    get selectMode() {
        return this._selectMode;
    }

    set selectMode(mode: SelectMode) {
        if (
            mode !== 'single' &&
            mode !== 'range' &&
            mode !== 'rangeFrom' &&
            mode !== 'rangeTo'
        ) {
            throw Error('H2TDateTime Error: invalid selectMode value!');
        }

        this._selectMode = mode;
    }

    /** The date to open the calendar to initially. */
    private _startAt: T | null;
    @Input()
    get startAt(): T | null {
        if (this._startAt) {
            return this._startAt;
        }

        if (this.selectMode === 'single') {
            return this.value || null;
        } else if (
            this.selectMode === 'range' ||
            this.selectMode === 'rangeFrom'
        ) {
            return this.values[0] || null;
        } else if (this.selectMode === 'rangeTo') {
            return this.values[1] || null;
        } else {
            return null;
        }
    }

    set startAt(date: T | null) {
        this._startAt = this.getValidDate(
            this.dateTimeAdapter.deserialize(date)
        );
    }

    private _dateTimeFilter: (date: T | null) => boolean;
    @Input('h2tDateTimeFilter')
    get dateTimeFilter() {
        return this._dateTimeFilter;
    }

    set dateTimeFilter(filter: (date: T | null) => boolean) {
        this._dateTimeFilter = filter;
    }

    /** The minimum valid date. */
    private _min: T | null;

    get minDateTime(): T | null {
        return this._min || null;
    }

    @Input('min')
    set minDateTime(value: T | null) {
        this._min = this.getValidDate(this.dateTimeAdapter.deserialize(value));
        this.changeDetector.markForCheck();
    }

    /** The maximum valid date. */
    private _max: T | null;

    get maxDateTime(): T | null {
        return this._max || null;
    }

    @Input('max')
    set maxDateTime(value: T | null) {
        this._max = this.getValidDate(this.dateTimeAdapter.deserialize(value));
        this.changeDetector.markForCheck();
    }

    private _value: T | null;
    @Input()
    get value() {
        return this._value;
    }

    set value(value: T | null) {
        value = this.dateTimeAdapter.deserialize(value);
        value = this.getValidDate(value);
        this._value = value;
        this.selected = value;
    }

    private _values: T[] = [];
    @Input()
    get values() {
        return this._values;
    }

    set values(values: T[]) {
        if (values && values.length > 0) {
            values = values.map(v => {
                v = this.dateTimeAdapter.deserialize(v);
                v = this.getValidDate(v);
                return v ? this.dateTimeAdapter.clone(v) : null;
            });
            this._values = [...values];
            this.selecteds = [...values];
        } else {
            this._values = [];
            this.selecteds = [];
        }
    }

    @Input()
    public displayMode: DisplayMode;

    /**
     * Emits selected year in multi-year view
     * This doesn't imply a change on the selected date.
     * */
    @Output()
    yearSelected = new EventEmitter<T>();

    /**
     * Emits selected month in year view
     * This doesn't imply a change on the selected date.
     * */
    @Output()
    monthSelected = new EventEmitter<T>();

    private _selected: T | null;
    get selected() {
        return this._selected;
    }

    set selected(value: T | null) {
        this._selected = value;
        this.changeDetector.markForCheck();
    }

    private _selecteds: T[] = [];
    get selecteds() {
        return this._selecteds;
    }

    set selecteds(values: T[]) {
        this._selecteds = values;
        this.changeDetector.markForCheck();
    }

    get opened(): boolean {
        return true;
    }

    get pickerMode(): PickerMode {
        return 'inline';
    }

    get isInSingleMode(): boolean {
        return this._selectMode === 'single';
    }

    get isInRangeMode(): boolean {
        return (
            this._selectMode === 'range' ||
            this._selectMode === 'rangeFrom' ||
            this._selectMode === 'rangeTo'
        );
    }

    get h2tDTInlineClass(): boolean {
        return true;
    }

    private onModelChange: Function = () => {};
    private onModelTouched: Function = () => {};

    constructor(
        protected changeDetector: ChangeDetectorRef,
        @Optional() protected dateTimeAdapter: DateTimeAdapter<T>,
        @Optional()
        @Inject(H2T_DATE_TIME_FORMATS)
        protected dateTimeFormats: H2TDateTimeFormats
    ) {
        super(dateTimeAdapter, dateTimeFormats);
    }

    public ngOnInit() {
        this.container.picker = this;
    }

    public writeValue(value: any): void {
        if (this.isInSingleMode) {
            this.value = value;
            this.container.pickerMoment = value;
        } else {
            this.values = value;
            this.container.pickerMoment = this._values[
                this.container.activeSelectedIndex
            ];
        }
    }

    public registerOnChange(fn: any): void {
        this.onModelChange = fn;
    }

    public registerOnTouched(fn: any): void {
        this.onModelTouched = fn;
    }

    public setDisabledState(isDisabled: boolean): void {
        this.disabled = isDisabled;
    }

    public select(date: T[] | T): void {
        if (this.disabled) {
            return;
        }

        if (Array.isArray(date)) {
            this.values = [...date];
        } else {
            this.value = date;
        }
        this.onModelChange(date);
        this.onModelTouched();
    }

    /**
     * Emits the selected year in multi-year view
     * */
    public selectYear(normalizedYear: T): void {
        this.yearSelected.emit(normalizedYear);
    }

    /**
     * Emits selected month in year view
     * */
    public selectMonth(normalizedMonth: T): void {
        this.monthSelected.emit(normalizedMonth);
    }
}
