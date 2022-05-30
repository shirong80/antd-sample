import { Component } from '@angular/core';

@Component({
  selector: 'app-sample-checkbox',
  templateUrl: './checkbox.component.html',
})
export class SampleCheckboxComponent {
  checked = true;

  allChecked = false;
  indeterminate = true;
  checkOptionsOne = [
    { label: 'Apple', value: 'Apple', checked: true },
    { label: 'Pear', value: 'Pear', checked: false },
    { label: 'Orange', value: 'Orange', checked: false },
  ];

  updateAllChecked(): void {
    this.indeterminate = false;
    if (this.allChecked) {
      this.checkOptionsOne = this.checkOptionsOne.map((item) => ({
        ...item,
        checked: true,
      }));
    } else {
      this.checkOptionsOne = this.checkOptionsOne.map((item) => ({
        ...item,
        checked: false,
      }));
    }
  }
  updateSingleChecked(): void {
    if (this.checkOptionsOne.every((item) => !item.checked)) {
      this.allChecked = false;
      this.indeterminate = false;
    } else if (this.checkOptionsOne.every((item) => item.checked)) {
      this.allChecked = true;
      this.indeterminate = false;
    } else {
      this.indeterminate = true;
    }
  }

  log(value: string[]): void {
    console.log(value);
  }
}
