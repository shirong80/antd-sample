import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConvertRoutingModule } from './convert-routing.module';
import { ConvertComponent } from './convert.component';

@NgModule({
  declarations: [ConvertComponent],
  imports: [CommonModule, ConvertRoutingModule],
  providers: [],
})
export class ConvertModule {}
