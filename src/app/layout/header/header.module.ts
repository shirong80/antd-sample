import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LayoutHeaderRoutingModule } from './header-routing.module';
import { LayoutHeaderComponent } from './header.component';

@NgModule({
  declarations: [LayoutHeaderComponent],
  exports: [LayoutHeaderComponent],
  imports: [CommonModule, LayoutHeaderRoutingModule],
  providers: [],
})
export class LayoutHeaderModule {}
