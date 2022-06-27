import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-sample-select',
  templateUrl: './select.component.html',
  styles: [
    `
      nz-select {
        width: 100%;
      }
    `,
  ],
})
export class SampleSelectComponent implements OnInit {
  listOfOption: Array<{ label: string; value: string }> = [];
  listOfTagOptions = [];

  ngOnInit(): void {
    const children: Array<{ label: string; value: string }> = [];
    for (let i = 10; i < 36; i++) {
      children.push({ label: i.toString(36) + i, value: i.toString(36) + i });
    }
    this.listOfOption = children;
  }
}
