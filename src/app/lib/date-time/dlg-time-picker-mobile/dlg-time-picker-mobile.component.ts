import { Component, OnInit, ViewChild, Inject } from '@angular/core';
import { DataPickerComponent, PickerDataModel } from '../ng-data-picker/data-picker.module';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'ngx-dlg-time-picker-mobile',
  templateUrl: './dlg-time-picker-mobile.component.html',
  styleUrls: ['./dlg-time-picker-mobile.component.scss']
})
export class DlgTimePickerMobileComponent implements OnInit {
  private timePicker: DataPickerComponent;
  @ViewChild(DataPickerComponent, { static: false })
    set page(content: DataPickerComponent) {
        if (content) {
            this.timePicker = content;
        }
    }
  dataReturn: any;
  data: Array<PickerDataModel> = [
    {
      currentIndex: (new Date()).getFullYear() - 1991,
      weight: 2,
      list: [],
      textAlign: 'center',
      className: 'dlg-time-picker-hour',
      onClick: this.clickOnHour.bind(this),
    },
    {
      currentIndex: (new Date()).getMonth(),
      weight: 2,
      list: [],
      textAlign: 'center',
      className: 'dlg-time-picker-min',
      onClick: this.clickOnMin.bind(this),
    }
  ]
  constructor(private dialogRef: MatDialogRef<DlgTimePickerMobileComponent>,
    @Inject(MAT_DIALOG_DATA) dataSent: any) {
    this.dataReturn = dataSent;
    this.pushString(this.data[0].list, 23, 0)
    this.pushString(this.data[1].list, 59,0)
    this.pushString(this.data[0].list, 23, 0)
    this.pushString(this.data[1].list, 59,0)
    this.pushString(this.data[0].list, 23, 0)
    this.pushString(this.data[1].list, 59,0)

    this.data[0].currentIndex =  dataSent.hour + 24;
    this.data[1].currentIndex =  dataSent.min + 60;
     }

  ngOnInit() {
  }
  dataChange ({ gIndex, iIndex }) {
    const ciList = this.timePicker.getCurrentIndexList()
    let hour = this.data[0].list[ciList[0]];
    let min = this.data[1].list[ciList[1]];
    
    this.dataReturn.hour = parseInt(hour);
    this.dataReturn.min = parseInt(min);
  }
  pushString(target: Array<string>, to: number = 24, from: number = 1): Array<string> {
    for (let i = from; i <= to; i++) {
      if(i < 10)
      {
        target.push('0' + i);
      }
      else
      {
        target.push(i.toString());
      }
      
    }
    return target
  }

  clickOnHour (gIndex, iIndex) {
    this.dialogRef.close(this.dataReturn);
  }
  clickOnMin (gIndex, iIndex) {
    this.dialogRef.close(this.dataReturn);
  }

}
