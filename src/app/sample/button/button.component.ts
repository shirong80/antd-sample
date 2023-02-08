import { Component, OnInit } from '@angular/core';
import { EMPTY } from 'rxjs';
import { take, catchError } from 'rxjs/operators';

import { SampleService } from '../sample.service';

@Component({
  selector: 'app-sample-button',
  templateUrl: './button.component.html',
})
export class SampleButtonComponent implements OnInit {
  constructor(private apiService: SampleService) {}

  ngOnInit(): void {}

  onClickChangegum() {
    this.apiService
      .getContent()
      .pipe(
        take(1),
        catchError((error) => {
          console.error(error);
          return EMPTY;
        }),
      )
      .subscribe((res) => console.log(res));
    // window.location.href = 'http://ebiz.sinokor.co.kr/BLDetail?blno=SNKO022210501060';
  }
}
