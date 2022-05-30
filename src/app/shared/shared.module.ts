import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// 커스텀 모듈
// * Checkbox
import { NzCheckboxModule } from './components/checkbox/checkbox.module';
// * Radio
import { NzRadioModule } from './components/radio/radio.module';

const customModules = [NzCheckboxModule, NzRadioModule];
@NgModule({
  imports: [CommonModule, FormsModule, customModules],
  exports: customModules,
})
export class SharedModule {}
