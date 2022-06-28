import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// 커스텀 모듈
// * Checkbox
import { NzCheckboxModule } from './components/checkbox/checkbox.module';
// * Radio
import { NzRadioModule } from './components/radio/radio.module';
// * select
import { NzSelectModule } from './components/select/select.module';
// * tooltip
import { NzToolTipModule } from './components/tooltip/tooltip.module';
// * button
import { NzButtonModule } from './components/button/button.module';

const MODULES = [
  NzCheckboxModule,
  NzRadioModule,
  NzSelectModule,
  NzToolTipModule,
  NzButtonModule,
];
@NgModule({
  imports: [CommonModule, FormsModule, MODULES],
  exports: MODULES,
})
export class SharedModule {}
