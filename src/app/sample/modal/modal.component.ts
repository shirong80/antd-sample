import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-sample-modal',
  templateUrl: './modal.component.html',
  styles: [],
})
export class SampleModalComponent implements OnInit {
  ngOnInit(): void {}

  isVisible = false;

  constructor() {}

  showModal(): void {
    this.isVisible = true;
  }

  handleOk(): void {
    console.log('Button ok clicked!');
    this.isVisible = false;
  }

  handleCancel(): void {
    console.log('Button cancel clicked!');
    this.isVisible = false;
  }
}
