import { BidiModule } from '@angular/cdk/bidi';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { NzRadioButtonDirective } from './radio-button.directive';
import { NzRadioGroupComponent } from './radio-group.component';
import { NzRadioComponent } from './radio.component';

@NgModule({
  imports: [BidiModule, CommonModule, FormsModule],
  exports: [NzRadioComponent, NzRadioButtonDirective, NzRadioGroupComponent],
  declarations: [
    NzRadioComponent,
    NzRadioButtonDirective,
    NzRadioGroupComponent,
  ],
})
export class NzRadioModule {}
