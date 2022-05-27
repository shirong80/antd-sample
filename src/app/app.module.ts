import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
// ng-zorro
import { NzButtonModule } from 'ng-zorro-antd/button';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, AppRoutingModule, NzButtonModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
