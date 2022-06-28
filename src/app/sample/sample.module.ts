import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// ng-zorro 모듈
import { NzElementPatchModule } from 'ng-zorro-antd/core/element-patch';

import { SharedModule } from 'src/app/shared/shared.module';

import { SampleRoutingModule } from './sample-routing.module';
import { SampleComponent } from './sample.component';

import { SampleCheckboxComponent } from './checkbox/checkbox.component';
import { SampleRadioComponent } from './radio/radio.component';
import { SampleSelectComponent } from './select/select.component';
import { SampleTooltipComponent } from './tooltip/tooltip.component';
import { SampleButtonComponent } from './button/button.component';

const COMPONENTS = [
  SampleCheckboxComponent,
  SampleRadioComponent,
  SampleSelectComponent,
  SampleTooltipComponent,
  SampleButtonComponent,
];

@NgModule({
  declarations: [SampleComponent, COMPONENTS],
  imports: [
    SampleRoutingModule,
    CommonModule,
    FormsModule,
    SharedModule,
    NzElementPatchModule,
  ],
  providers: [],
})
export class SampleModule {}
