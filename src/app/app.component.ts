import { Component, Renderer2 } from '@angular/core';
import { Moment } from 'moment';
import * as moment from 'moment-timezone';
import { H2TDateTimeComponent } from './lib/date-time/date-time-picker.component';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { DlgTimePickerMobileComponent } from './lib/date-time/dlg-time-picker-mobile/dlg-time-picker-mobile.component';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'demo';
  public selectedMoments: Moment[] = [
    moment('2019-03-11T08:00:00+11:00').tz('Australia/Sydney'),
    moment('2019-03-11T15:00:00+11:00').tz('Australia/Sydney')
  ];

  constructor(private dialogDatePicker: MatDialog, private renderer: Renderer2) {
    // console.log('picker dom', elementRef.nativeElement)
  }

  public loadExternalScript(url: string) {
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = url;
    script.async = true;
    script.defer = true;
    this.renderer.appendChild(document.body, script);
  }

  openDialogTimePicker(event){
    const dialogConfig = new MatDialogConfig();
    let element = event.srcElement.getBoundingClientRect();
    dialogConfig.autoFocus = false;
    dialogConfig.position = {
      top: (element.y) + 'px',
      left: (element.x)+ 'px'
    };
    dialogConfig.width = '80px';
    dialogConfig.panelClass = 'dlg-time-picker';
    dialogConfig.backdropClass = 'dlg-time-picker-backdrop';

    dialogConfig.data = {
          hour: 12,
          min: 30,
          timeType: 'taiht'
        };
    dialogConfig.width = (element.width + 36) + 'px';
    dialogConfig.maxWidth = (element.width + 36) + 'px';

    const dialogRef = this.dialogDatePicker.open(DlgTimePickerMobileComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // if (result.timeType === 'sTimePartB1') {
        //   this.partsDatas.lstTimePartB1[i].hour = (result.hour < 10 ? '0' + result.hour : result.hour);
        //   this.partsDatas.lstTimePartB1[i].min = (result.min < 10 ? '0' + result.min : result.min);
        //   this.partsDatas.lstTimePartB1[i].title = this.partsDatas.lstTimePartB1[i].hour + ':' + this.partsDatas.lstTimePartB1[i].min;
        // }
        // this.partsDatas.visitRecordDto.dataPart1[i].startDate = this.setTimePartB1(i);
        // this.mapPartsTempData('startDate_', this.partsDatas.visitRecordDto.dataPart1[i], i, this.partsDatas.visitRecordDto.dataPart1[i].startDate, 'part1');
        // this.onInput.emit(this.partsDatas);
      }
    });
  }
}


