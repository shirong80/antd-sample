import { A11yModule } from '@angular/cdk/a11y';
import { BidiModule } from '@angular/cdk/bidi';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { NzCheckboxGroupComponent } from './checkbox-group.component';
import { NzCheckboxWrapperComponent } from './checkbox-wrapper.component';
import { NzCheckboxComponent } from './checkbox.component';

@NgModule({
  imports: [BidiModule, CommonModule, FormsModule, A11yModule],
  declarations: [
    NzCheckboxComponent,
    NzCheckboxGroupComponent,
    NzCheckboxWrapperComponent,
  ],
  exports: [
    NzCheckboxComponent,
    NzCheckboxGroupComponent,
    NzCheckboxWrapperComponent,
  ],
})
export class NzCheckboxModule {}
