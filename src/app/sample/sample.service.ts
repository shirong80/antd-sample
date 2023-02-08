import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

const url = 'http://ebiz.sinokor.co.kr/BLDetail?blno=SNKO022210501060';

@Injectable({ providedIn: 'root' })
export class SampleService {
  constructor(private http: HttpClient) {}

  getContent(): Observable<any> {
    return this.http.get(url);
  }
}
