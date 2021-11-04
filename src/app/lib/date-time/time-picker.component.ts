/**
 * calendar-body.component
 */

import {
    Component,
    ElementRef,
    EventEmitter,
    Input,
    NgZone,
    OnInit,
    Output,
    AfterViewInit,
    ViewChild
} from '@angular/core';

@Component({
    selector: 'h2t-time-picker',
    exportAs: 'h2tTimePicker',
    templateUrl: './time-picker.component.html',
    styleUrls: ['./time-picker.component.scss'],
})
export class H2TTimePickerComponent implements OnInit, AfterViewInit {
  @ViewChild("timeSelector", { static: false }) timeSelector: ElementRef;
  @ViewChild("inputTime", { static: false }) inputTime: ElementRef;
  borderColorDisabled: string = '#e7e9e9';
  borderColorEnable: string = '#007aff';
  textColorDisabled: string = '#000';
  textColorEnable: string = '#007aff';
  timeInputValue: number;
  @Output() outputHour = new EventEmitter<string>();
  @Output() outputMinute = new EventEmitter<string>();
  @Input() inputHour: number;
  @Input() inputMinute: number;
    ngOnInit(){
    }
    ngAfterViewInit(){
        // time
        let hours = new Array(24).fill(1).map((v, i) => { 
        //   return {value: (i + 11) % 12 + 1 , text: (i + 11) % 12 + 1 };
            return {value: i === 23 ? 0 : (i + 1) , text: i === 23 ? '00' : (i < 9 ? '0' + (i + 1) : (i + 1)) };
        });
    
        let minutes = new Array(60).fill(1).map((v, i) => {
        return { value: i <= 10 , text: i <= 10} ? { value: `0${i}`.slice(-2) , text:  `0${i}`.slice(-2) } :{ value: i , text: i }
        });
    
        let ampm = new Array("AM" , "PM").map((v, i) => {
          return  { value: `${v}`, text: `${v}`}
        });
    
        let currentMinute =new Date().getMinutes();
        let currentHour = new Date().getHours();
        let currentMeridain = new Date().getHours() >= 12 ? 'PM' : 'AM';
    
        let hourSelector;
        let minuteSelector;
        let meridainSelector;
    
        hourSelector = new IosSelector({
          el: '#hour',
          type: 'infinite',
          timeType: 'hour',
          elInputTime: this.inputTime.nativeElement,
          source: hours,
          count: 4,
          selector: this.timeSelector.nativeElement,
          minuteElement: minuteSelector,
          hourElement: hourSelector,
          borderColorDisabled: this.borderColorDisabled,
          borderColorEnable: this.borderColorEnable,
          textColorDisabled: this.textColorDisabled,
          textColorEnable: this.textColorEnable,
          onChange: (selected) => {
            currentHour = selected.value;
            this.outputHour.emit(selected.value);
          },
          onChangeInputTime: (type, value) => {
            if(type === 'minute'){
              minuteSelector.select(value);
              minuteSelector.onChange({value: value});
            }else if(type === 'hour'){
              hourSelector.select(value);
              minuteSelector.onChange({value: value});
            }
          }
        });
    
        minuteSelector = new IosSelector({
          el: '#minute',
          type: 'infinite',
          timeType: 'minute',
          elInputTime: this.inputTime.nativeElement,
          source: minutes,
          count: 4,
          selector: this.timeSelector.nativeElement,
          minuteElement: minuteSelector,
          hourElement: hourSelector,
          borderColorDisabled: this.borderColorDisabled,
          borderColorEnable: this.borderColorEnable,
          textColorDisabled: this.textColorDisabled,
          textColorEnable: this.textColorEnable,
          onChange: (selected) => {       
            this.outputMinute.emit(selected.value);
          }
        });
    
        meridainSelector = new IosSelector({
          el: '#meridium',
          type: 'normal',
          source: ampm,
          //count: 2,
        onChange: (selected) => {
          currentMeridain = selected.value;
        }
        });    
    
        let d = new Date(); // for now
        let hourSelect = this.inputHour;
        let minuteSelect = this.inputMinute;
    
        setTimeout(function() {    
            if(![null, undefined].includes(hourSelect)){
              hourSelector.select(hourSelect);
            }else{
              hourSelector.select(d.getHours());
            }

            if(![null, undefined].includes(minuteSelect)){
              minuteSelector.select( String(minuteSelect).padStart(2, '0') );
            }else{
              minuteSelector.select( String(d.getMinutes()).padStart(2, '0') );
            }
            
            meridainSelector.select(d.getHours() >= 12 ? 'PM' : 'AM');
        });
    }
    openInputTime(e){
      // e.preventDefault();
      // document.getElementById('hour').focus();
      // this.inputTime.nativeElement.focus();
    }
}

const easing = {
    easeOutCubic: function(pos) {
      return (Math.pow((pos-1), 3) +1);
    },
    easeOutQuart: function(pos) {
      return -(Math.pow((pos-1), 4) -1);
    },
  };

export class IosSelector {
    options: any;
    halfCount: any;
    quarterCount: any;
    a: any;
    minV: any;
    selected: any;
    source: any;
    exceedA = 10; 
    moveT = 0; 
    moving = false;
    elems: any;
    events: any;
    itemHeight: any;
    itemAngle: any;
    radius: any;
    scroll: any;
    value: any;
    type: any;  
  
    constructor(options) {
      let defaults = {
        el: '', // dom 
        type: 'infinite', // infinite ，normal  
        count: 20,
        sensitivity: 0.8,
        source: [], // {value: xx, text: xx}
        value: null,
        onChange: null
      };
  
      this.options = Object.assign({}, defaults, options);
      this.options.count =  this.options.count - this.options.count % 4;
      Object.assign(this, this.options);
  
      this.halfCount = this.options.count / 2;
      this.quarterCount = this.options.count / 4;
      this.a = this.options.sensitivity * 10; // Rolling speed
      this.minV = Math.sqrt(1 / this.a); // Minimum initial velocity
      this.selected = this.source[0];
  
      this.elems = {
        el: this.options.selector ? this.options.selector.querySelector(this.options.el) : null,
        elDivide: this.options.selector ? this.options.selector.querySelector('.divide-time') : null,
        circleList: null,
        circleItems: null, // list
  
        highlight: null,
        highlightList: null,
        highListItems: null // list
      };
      this.events = {
        touchstart: null,
        touchmove: null,
        touchend: null
      };
  
      if(this.elems.el){
        // this.itemHeight = this.elems.el.offsetHeight * 3 / this.options.count; // Altitude
        this.itemHeight = this.elems.el.parentNode.parentNode.offsetHeight;
      }
      
      this.itemAngle = 360 / this.options.count; // Frequency of rotation
      this.radius = this.itemHeight / Math.tan(this.itemAngle * Math.PI / 180); // Roundabout radius
  
      this.scroll = 0; // Single item item altitude (frequency)
      this._init();
    }
  
    _init() {
      if (!this.elems.el) {
          return;
        }
      this._create(this.options.source);
  
      let touchData = {
        startY: 0,
        yArr: []
      };
  
      for (let eventName in this.events) {
        this.events[eventName] = ((eventName) => {
          return (e) => {
            if (this.elems.el.contains(e.target) || e.target === this.elems.el) {
              e.preventDefault();
              if (this.source.length) {
                this['_' + eventName](e, touchData);
              }
            }
          };
        })(eventName);
      }
  
      this.elems.el.addEventListener('touchstart', this.events.touchstart);
      document.addEventListener('mousedown', this.events.touchstart);
      this.elems.el.addEventListener('touchend', this.events.touchend);
      document.addEventListener('mouseup', this.events.touchend);
      if (this.source.length) {
        this.value = this.value !== null ? this.value : this.source[0].value;
        this.select(this.value);
      }

      if(this.options.timeType === 'hour'){
        this.options.elInputTime.addEventListener("keypress", (e) => this.inputKeyPress(e));
        this.options.elInputTime.addEventListener("keyup", (e) => this.inputKeyup(e));
        this.options.elInputTime.addEventListener("blur", (e) => this.inputElementOnBlur());        
      }
      this.options.elInputTime.addEventListener("focus", (e) => this.inputElementOnFocus()); 
    }

    inputKeyup(e){
      if(e.keyCode != 8) return;

      let elHour = this.options.selector.querySelector('#input-hour');
      let elMinute = this.options.selector.querySelector('#input-minute');

      let hourValue = elHour.innerHTML;
      let minuteValue = elMinute.innerHTML;
      let timeString = hourValue + minuteValue;

      if(timeString.length === 1){
        elMinute.innerHTML = '';
      }else if(timeString.length === 2){
        elMinute.innerHTML = minuteValue.substring(minuteValue.length - 1, minuteValue.length);
      }else if(timeString.length === 3){
        elMinute.innerHTML = elHour.innerHTML + elMinute.innerHTML.substring(0, 1);
        elHour.innerHTML = '';        
      }else{
        let cutString = elHour.innerHTML.substring(1, 2);
        elHour.innerHTML = elHour.innerHTML.substring(0, 1);
        elMinute.innerHTML = cutString + elMinute.innerHTML.substring(0, 1);
      }
    }

    inputKeyPress(e){
      if(e.keyCode < 48 || e.keyCode > 57) return;
      let elHour = this.options.selector.querySelector('#input-hour');
      let elMinute = this.options.selector.querySelector('#input-minute');
      let value = this.options.elInputTime.value;
      if(!value){
        elHour.innerHTML = '';
        elMinute.innerHTML = '';
      }

      let hourValue = elHour.innerHTML;
      let minuteValue = elMinute.innerHTML;
      let timeString = hourValue + minuteValue;

      if(timeString.length < 2){
        minuteValue += e.key;        
        elMinute.innerHTML = minuteValue;
      }else if(timeString.length === 2){
        elHour.innerHTML = elMinute.innerHTML.substring(0, 1);
        elMinute.innerHTML = elMinute.innerHTML.substring(1, 2) + e.key;
      }else if(timeString.length === 3){
        elHour.innerHTML += elMinute.innerHTML.substring(0, 1);
        elMinute.innerHTML = elMinute.innerHTML.substring(1, 2) + e.key;
      }else if(timeString.length === 4){
        elHour.innerHTML = elHour.innerHTML.substring(1, 2) + elMinute.innerHTML.substring(0, 1);
        elMinute.innerHTML = elMinute.innerHTML.substring(1, 2) + e.key;        
        if(elHour.innerHTML > 24){
          elHour.innerHTML = '0' + elHour.innerHTML.substring(1, 2);
        }
      }

      hourValue = elHour.innerHTML;
      minuteValue = elMinute.innerHTML;

      if(minuteValue.length == 2 && minuteValue > 65 && !minuteValue.includes('0') && minuteValue.substring(1,2) > 5){
        elMinute.innerHTML = '0' + minuteValue.substring(1,2)
      }

      let minuteSelect = minuteValue < 10 ? '0' + minuteValue : minuteValue;
      let hourSelect = hourValue = hourValue == 24 ? 0 : hourValue;
      if(minuteSelect > 0) this.options.onChangeInputTime('minute', minuteSelect);
      if(![''].includes(hourSelect)) this.options.onChangeInputTime('hour', parseInt(hourSelect));
    }

    inputElementOnFocus(){
      this.elems.highlight.style.opacity = 0;
      this.elems.circleList.style.display = 'none';
      let timeTypeOther = this.options.timeType === 'hour' ? 'minute' : 'hour';
      let elTimeOther = this.options.selector.querySelector('#' + timeTypeOther);
      if(elTimeOther){
        let highlight = elTimeOther.querySelector('.highlight');
        let circleList = elTimeOther.querySelector('.select-options');
        if(highlight) highlight.style.opacity = 0;
        if(circleList) circleList.style.display = 'none';
      }
      this.refreshValueInput();
    }

    inputElementOnBlur(){
      this.elems.highlight.style.opacity = 1;
      this.elems.circleList.style.display = 'flex';
      let timeTypeOther = this.options.timeType === 'hour' ? 'minute' : 'hour';
      let elTimeOther = this.options.selector.querySelector('#' + timeTypeOther);
      if(elTimeOther){
        let highlight = elTimeOther.querySelector('.highlight');
        let circleList = elTimeOther.querySelector('.select-options');
        if(highlight) highlight.style.opacity = 1;
        if(circleList) circleList.style.display = 'flex';
      }
    }

    refreshValueInput(){
      if(this.options.timeType === 'hour'){
        if(this.scroll === 23){
          this.elems.inputTime.innerHTML = '00';
          return;
        }
        this.elems.inputTime.innerHTML = (this.scroll % 24) < 9 ? '0' + (this.scroll + 1) : (this.scroll + 1);
      }else if(this.options.timeType === 'minute'){
        this.elems.inputTime.innerHTML = (this.scroll % 60) < 10 ? '0' + this.scroll : this.scroll;
      }
    }

    selectedValue(){
      this.selected = this.source[Math.round(this.scroll)];
      this.value = this.selected.value;
      this.options.onChange && this.options.onChange(this.selected);
    }

    cancelInput(){
      this.elems.highlightList.style.color = this.options.textColorDisabled;
      this.elems.highlight.style.borderColor = this.options.borderColorDisabled;
      this.elems.highlight.style.borderWidth = 'unset';
      this.elems.highlight.style.borderStyle = 'unset';
      this.elems.elDivide.style.border = 'none';

      if(this.options.timeType == 'hour'){
        this.elems.highlight.style.borderRight = 'none';
        let elMinute = this.options.selector.querySelector('#minute');
        if(elMinute){
          elMinute.style.pointerEvents = 'all';
          elMinute.style.touchAction = 'auto';
          let minuteHighlight = elMinute.querySelector('.highlight');
          if(minuteHighlight){
            minuteHighlight.style.borderWidth = 'unset';
            minuteHighlight.style.borderStyle = 'unset';
            minuteHighlight.style.borderColor = this.options.borderColorDisabled;
          }
        }
      }else{
        this.elems.highlight.style.borderLeft = 'none';
        let elHour = this.options.selector.querySelector('#hour');
        if(elHour){
          elHour.style.pointerEvents = 'all';
          let hourHighlight = elHour.querySelector('.highlight');
          if(hourHighlight){
            hourHighlight.style.borderWidth = 'unset';
            hourHighlight.style.borderStyle = 'unset';
          }
        }
      }
    }

    stopScroll(initScroll?, totalScrollLen?){
      this._stop();
      if(initScroll && totalScrollLen){
        this.scroll = this._moveTo(initScroll + totalScrollLen);
      }
      
      this.cancelInput();
      this.refreshValueInput();
    }
  
    _touchstart(e, touchData) {
      console.log(e.clientY);
      this.elems.el.addEventListener('touchmove', this.events.touchmove);
      document.addEventListener('mousemove', this.events.touchmove);
      let eventY = e.clientY || e.touches[0].clientY;
      touchData.startY = eventY;
      touchData.yArr = [[eventY, new Date().getTime()]];
      touchData.touchScroll = this.scroll;
    }
  
    _touchmove(e, touchData) {
      this.elems.highlightList.style.color = this.options.textColorEnable;
      this.elems.highlight.style.borderColor = this.options.borderColorEnable;
      this.elems.highlight.style.borderWidth = '1px';
      this.elems.highlight.style.borderStyle = 'solid';
      this.elems.elDivide.style.border = `1px solid ${this.options.borderColorEnable}`;
      this.elems.elDivide.style.borderLeft = 'none';
      this.elems.elDivide.style.borderRight = 'none';
      if(this.options.timeType == 'hour'){
        this.elems.highlight.style.borderRight = 'none';
        let elMinute = this.options.selector.querySelector('#minute');
        if(elMinute){
          elMinute.style.pointerEvents = 'none';
          let minuteHighlight = elMinute.querySelector('.highlight');
          if(minuteHighlight){
            minuteHighlight.style.borderWidth = '1px';
            minuteHighlight.style.borderStyle = 'solid';
            minuteHighlight.style.borderLeft = 'none';
            minuteHighlight.style.borderColor = this.options.borderColorEnable;
          }
        }
      }else{
        this.elems.highlight.style.borderLeft = 'none';
        let elHour = this.options.selector.querySelector('#hour');
        if(elHour){
          elHour.style.pointerEvents = 'none';
          elHour.style.touchAction = 'none';
          let hourHighlight = elHour.querySelector('.highlight');
          if(hourHighlight){
            hourHighlight.style.borderWidth = '1px';
            hourHighlight.style.borderStyle = 'solid';
            hourHighlight.style.borderRight = 'none';
            hourHighlight.style.borderColor = this.options.borderColorEnable;
          }
        }
      }

      let eventY = e.clientY || e.touches[0].clientY;
      touchData.yArr.push([eventY, new Date().getTime()]);
      if (touchData.length > 5) {
        touchData.unshift();
      }
  
      let scrollAdd = (touchData.startY - eventY) / this.itemHeight;
      let moveToScroll = scrollAdd + this.scroll;
  
      // At the time of non-infinite movement, it is difficult to obtain a super-departure sword
      if (this.type === 'normal') {
        if (moveToScroll < 0) {
          moveToScroll *= 0.3;
        } else if (moveToScroll > this.source.length) {
          moveToScroll = this.source.length + (moveToScroll - this.source.length) * 0.3;
        }
      } else {
        moveToScroll = this._normalizeScroll(moveToScroll);
      }
  
      touchData.touchScroll = this._moveTo(moveToScroll);
    }
  
    _touchend(e, touchData) {
      this.elems.el.removeEventListener('touchmove', this.events.touchmove);
      document.removeEventListener('mousemove', this.events.touchmove);
  
      let v;
  
      if (touchData.yArr.length === 1) {
        v = 0;
        if(this.moving){
          this.stopScroll();
        }else{
          this.options.elInputTime.focus();
        }
      } else {
        this.options.elInputTime.blur();
        let startTime = touchData.yArr[touchData.yArr.length - 2][1];
        let endTime = touchData.yArr[touchData.yArr.length - 1][1];
        let startY = touchData.yArr[touchData.yArr.length - 2][0];
        let endY = touchData.yArr[touchData.yArr.length - 1][0];
  
        // Calculation speed
        v = ((startY - endY) / this.itemHeight) * 1000 / (endTime - startTime);
        let sign = v > 0 ? 1 : -1;
  
        v = Math.abs(v) > 30 ? 30 * sign : v;
      }

      this._stop();  
      this.scroll = touchData.touchScroll;
      this._animateMoveByInitV(v);
    }
  
    _create(source) {  
      if (!source.length || !this.elems.el) {
        return;
      }
  
      let template = `
        <div class="select-wrap">
          <ul class="select-options" style="transform: translate3d(0, 0, ${-this.radius}px) rotateX(0deg);">
            {{circleListHTML}}
            <!-- <li class="select-option">a0</li> -->
          </ul>
          <div class="highlight">
            <ul class="highlight-list">
              <!-- <li class="highlight-item"></li> -->
              {{highListHTML}}
            </ul>
          </div>
          <span id='input-${this.options.timeType}'></span>
        </div>        
      `;
  
      if (this.options.type === 'infinite') {
        let concatSource = [].concat(source);
        while (concatSource.length < this.halfCount) {
          concatSource = concatSource.concat(source);
        }
        source = concatSource;
      }
      this.source = source;
      let sourceLength = source.length;
  
      let circleListHTML = '';
      for (let i = 0; i < source.length; i++) {
        circleListHTML += `<li class="select-option"
                      style="
                        top: ${this.itemHeight * -0.5 }px;
                        height: ${this.itemHeight}px;
                        line-height: ${this.itemHeight}px;
                        transform: rotateX(${-this.itemAngle * i}deg) translate3d(0, 0, ${this.radius}px);
                      "
                      data-index="${i}"
                      data-value="${source[i].value}"
                      >${source[i].text}</li>`
      }
  
      let highListHTML = '';
      for (let i = 0; i < source.length; i++) {
        highListHTML += `<li class="highlight-item" style="height: ${this.itemHeight}px;">
                          ${source[i].text}
                        </li>`
      }  
  
      if (this.options.type === 'infinite') {
        for (let i = 0; i < this.quarterCount; i++) {
          circleListHTML = `<li class="select-option"
                        style="
                          top: ${this.itemHeight * -0.5}px;
                          height: ${this.itemHeight}px;
                          line-height: ${this.itemHeight}px;
                          transform: rotateX(${this.itemAngle * (i + 1)}deg) translate3d(0, 0, ${this.radius}px);
                        "
                        data-index="${-i - 1}"
                        data-value="${source[sourceLength - i - 1].value}"
                        >${source[sourceLength - i - 1].text}</li>` + circleListHTML;

          circleListHTML += `<li class="select-option"
                        style="
                          top: ${this.itemHeight * -0.5}px;
                          height: ${this.itemHeight}px;
                          line-height: ${this.itemHeight}px;
                          transform: rotateX(${-this.itemAngle * (i + sourceLength)}deg) translate3d(0, 0, ${this.radius}px);
                        "
                        data-index="${i + sourceLength}"
                        data-value="${source[i].value}"
                        >${source[i].text}</li>`;
        }
  
        highListHTML = `<li class="highlight-item" style="height: ${this.itemHeight}px;">
                            ${source[sourceLength - 1].text}
                        </li>` + highListHTML;
        highListHTML += `<li class="highlight-item" style="height: ${this.itemHeight}px;">${source[0].text}</li>`
      }
  
      if(this.elems.el){
        this.elems.el.innerHTML = template
                                  .replace('{{circleListHTML}}', circleListHTML)
                                  .replace('{{highListHTML}}', highListHTML);
      }
      
      this.elems.circleList = this.elems.el.querySelector('.select-options');
      this.elems.circleItems = this.elems.el.querySelectorAll('.select-option');
  
  
      this.elems.highlight = this.elems.el.querySelector('.highlight');
      this.elems.highlightList = this.elems.el.querySelector('.highlight-list');
      this.elems.highlightitems = this.elems.el.querySelectorAll('.highlight-item');
      this.elems.inputTime = this.elems.el.querySelector(`#input-${this.options.timeType}`);
  
      if (this.type === 'infinite') {
        this.elems.highlightList.style.top = -this.itemHeight + 'px';
      }
  
      this.elems.highlight.style.height = this.itemHeight + 'px';
      this.elems.highlight.style.lineHeight = this.itemHeight + 'px';
      this.elems.inputTime.style.height = this.itemHeight + 'px';
      this.elems.inputTime.style.lineHeight = this.itemHeight + 'px';
      this.elems.inputTime.style.color = '#007aff';

      let divideTime = this.elems.el.parentNode.querySelector('.divide-time');
      if(divideTime){
        divideTime.style.height = this.itemHeight + 'px';
        divideTime.style.lineHeight = this.itemHeight + 'px';
      }
    }
  
    /**
     * Opposite scroll Modulo，eg source.length = 5 scroll = 6.1 
     * normalizedScroll = 1.1
     * @param {init} scroll 
     * @return normalizedScroll
     */
    _normalizeScroll(scroll) {
      let normalizedScroll = scroll;
  
      while(normalizedScroll < 0) {
        normalizedScroll += this.source.length;
      }
      normalizedScroll = normalizedScroll % this.source.length;
      return normalizedScroll;
    }
  
    /**
     * @param {init} scroll 
     * @return
     */
    _moveTo(scroll) {
      if (this.type === 'infinite') {
        scroll = this._normalizeScroll(scroll);
      }
      if(this.elems.circleList){
        this.elems.circleList.style.transform = `translate3d(0, 0, ${-this.radius}px) rotateX(${this.itemAngle * scroll}deg)`;
      }
      if(this.elems.highlightList){
        this.elems.highlightList.style.transform = `translate3d(0, ${-(scroll) * this.itemHeight}px, 0)`;
      }
  
      // let transformElement = `rotateX(${Math.round(this.itemAngle * scroll)}deg)`;
      if(this.elems.circleItems){
        [...this.elems.circleItems].forEach(itemElem => {
            if (Math.abs(itemElem.dataset.index - scroll) > this.quarterCount) {
              itemElem.style.visibility = 'hidden';
            } else {
              itemElem.style.visibility = 'visible';
            }

            // let transformString = itemElem.style.transform;
            // if(transformString.includes(transformElement)){
            //   itemElem.style.color = 'green';
            // }else{
            //   itemElem.style.color = 'inherit';
            // }
            // let rotate = transformString.match(/rotateX\((.+)\)/);
          });
      }
  
      return scroll;
    }
  
    /**
     * At initial speed initV scroll
     * @param {init} initV， initV will be reset
     * To ensure scrolling to the integer scroll according to the acceleration (guaranteed to be able to locate a selected value by scroll)
     */
    async _animateMoveByInitV(initV) {
      let initScroll;
      let finalScroll;
      let finalV;
  
      let totalScrollLen;
      let a;
      let t;
  
      if (this.type === 'normal') {
  
        if (this.scroll < 0 || this.scroll > this.source.length - 1) {
          a = this.exceedA;
          initScroll = this.scroll;
          finalScroll = this.scroll < 0 ? 0 : this.source.length - 1;
          totalScrollLen = initScroll - finalScroll;
  
          t = Math.sqrt(Math.abs(totalScrollLen / a));
          initV = a * t;
          initV = this.scroll > 0 ? -initV : initV;
          finalV = 0;
          await this._animateToScroll(initScroll, finalScroll, t);
        } else {
          initScroll = this.scroll;
          a = initV > 0 ? -this.a : this.a; // Deceleration acceleration
          t = Math.abs(initV / a); // Speed reduced to 0 takes time
          totalScrollLen = initV * t + a * t * t / 2; // Total rolling length
          finalScroll = Math.round(this.scroll + totalScrollLen); // Round to ensure accuracy and finally scroll to an integer
          finalScroll = finalScroll < 0 ? 0 : (finalScroll > this.source.length - 1 ? this.source.length - 1 : finalScroll);
  
          totalScrollLen = finalScroll - initScroll;
          t = Math.sqrt(Math.abs(totalScrollLen / a));
          await this._animateToScroll(this.scroll, finalScroll, t, 'easeOutQuart');
        }
  
      } else {
        initScroll = this.scroll;
  
        a = initV > 0 ? -this.a : this.a; // Deceleration acceleration
        t = Math.abs(initV / a); // Speed reduced to 0 takes time
        totalScrollLen = initV * t + a * t * t / 2; // Total rolling length
        finalScroll = Math.round(this.scroll + totalScrollLen); // Round to ensure accuracy and finally scroll to an integer
        await this._animateToScroll(this.scroll, finalScroll, t, 'easeOutQuart');
      }
  
      await this._animateToScroll(this.scroll, finalScroll, initV);
      
      this._selectByScroll(this.scroll);
    }
  
    _animateToScroll(initScroll, finalScroll, t, easingName = 'easeOutQuart') {
      if (initScroll === finalScroll || t === 0) {
        this._moveTo(initScroll);
        return;
      }
  
      let start = new Date().getTime() / 1000;
      let pass = 0;
      let totalScrollLen = finalScroll - initScroll;
      
      return new Promise((resolve, reject) => {
        this.moving = true;
        let tick = () => {
          pass = new Date().getTime() / 1000 - start;
  
          if (pass < t) {
            this.scroll = this._moveTo(initScroll + easing[easingName](pass / t) * totalScrollLen);
            this.moveT = requestAnimationFrame(tick);
          } else {
            // resolve();
            this.stopScroll(initScroll, totalScrollLen);
          }
        };
        tick();
      });
    }
  
    _stop() {
      this.moving = false;
      cancelAnimationFrame(this.moveT);
    }
  
    _selectByScroll(scroll) {
      scroll = this._normalizeScroll(scroll) | 0;
      if (scroll > this.source.length - 1) {
        scroll = this.source.length - 1;
        this._moveTo(scroll);
      }
      this._moveTo(scroll);
      this.scroll = scroll;
      this.selected = this.source[scroll];
      this.value = this.selected.value;
      this.options.onChange && this.options.onChange(this.selected);
    }
  
    updateSource(source) {
      this._create(source);
  
      if (!this.moving) {
        this._selectByScroll(this.scroll);
      }
    }
  
    select(value) {
      for (let i = 0; i < this.source.length; i++) {
        if (this.source[i].value === value) {
          window.cancelAnimationFrame(this.moveT);
          this.scroll = this._moveTo(i);
          let initScroll = this._normalizeScroll(this.scroll);
          let finalScroll = i;
          let t = Math.sqrt(Math.abs((finalScroll -  initScroll) / this.a));
          this._animateToScroll(initScroll, finalScroll, t);
          setTimeout(() => this._selectByScroll(i));
          return;
        }
      }
      throw new Error(`can not select value: ${value}, ${value} match nothing in current source`);
    }
  
    destroy() {
      this._stop();
      // document Event unbind
      for (let eventName in this.events) {
        this.elems.el.removeEventListener('eventName', this.events[eventName]);
      }
      document.removeEventListener('mousedown', this.events['touchstart']);
      document.removeEventListener('mousemove', this.events['touchmove']);
      document.removeEventListener('mouseup', this.events['touchend']);
      // Element removal
      this.elems.el.innerHTML = '';
      this.elems = null;
    }
  }

  // date logic


// function getYears() {
// 	let currentYear = new Date().getFullYear();
// 	let years = [];

// 	for (let i = currentYear - 20; i < currentYear + 20; i++) {
// 		years.push({
// 			value: i,
// 			text: i + '年'
// 		});
// 	}
// 	return years;
// }

// function getMonths(year) {
// 	let months = [];
// 	for (let i = 1; i <= 12; i++) {
// 		months.push({
// 			value: i,
// 			text: i + '月'
// 		});
// 	}
// 	return months;
// }

// function getDays(year, month) {
// 	let dayCount = new Date(year,month,0).getDate(); 
// 	let days = [];

// 	for (let i = 1; i <= dayCount; i++) {
// 		days.push({
// 			value: i,
// 			text: i + '日'
// 		});
// 	}

// 	return days; 
// }

// let currentYear = new Date().getFullYear();
// let currentMonth = 1;
// let currentDay = 1;

// let yearSelector;
// let monthSelector;
// let daySelector;

// let yearSource = getYears();
// //alert(typeof yearSource);
// let monthSource = getMonths();
// let daySource = getDays(currentYear, currentMonth);

// yearSelector = new IosSelector({
// 	el: '#year1',
// 	type: 'infinite',
// 	source: yearSource,
// 	count: 20,
// 	onChange: (selected) => {
// 		currentYear = selected.value;
// 		daySource = getDays(currentYear, currentMonth);
// 		daySelector.updateSource(daySource);
// //		console.log(yearSelector.value, monthSelector.value, daySelector.value);
// 	}
// });

// monthSelector = new IosSelector({
// 	el: '#month1',
// 	type: 'infinite',
// 	source: monthSource,
// 	count: 20,
// 	onChange: (selected) => {
// 		currentMonth = selected.value;
		
// 		daySource = getDays(currentYear, currentMonth);
// 		daySelector.updateSource(daySource);
// //		console.log(yearSelector.value, monthSelector.value, daySelector.value);
// 	}
// });

// daySelector = new IosSelector({
// 	el: '#day1',
// 	type: 'infinite',
// 	source: [],
// 	count: 20,
// 	onChange: (selected) => {
// 		currentDay = selected.value;
// //		console.log(yearSelector.value, monthSelector.value, daySelector.value);
// 	}
// });


// let now = new Date();


// setTimeout(function() {
//   yearSelector.select(now.getFullYear());
//   monthSelector.select(now.getMonth() + 1);
//   daySelector.select(now.getDate()); 
// });
