import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LayoutMenuRoutingModule } from './menu-routing.module';
import { LayoutMenuComponent } from './menu.component';

@NgModule({
  declarations: [LayoutMenuComponent],
  exports: [LayoutMenuComponent],
  imports: [CommonModule, LayoutMenuRoutingModule],
  providers: [],
})
export class LayoutMenuModule {}
