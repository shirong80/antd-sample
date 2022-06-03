import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LayoutHeaderModule } from '../app/layout/header/header.module';
import { LayoutMenuModule } from './layout/menu/menu.module';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    LayoutHeaderModule,
    LayoutMenuModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
