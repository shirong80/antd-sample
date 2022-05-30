import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { SharedModule } from 'src/app/shared/shared.module';

import { SampleRoutingModule } from './sample-routing.module';
import { SampleComponent } from './sample.component';

import { SampleCheckboxComponent } from './checkbox/checkbox.component';
import { SampleRadioComponent } from './radio/radio.component';

const COMPONENTS = [SampleCheckboxComponent, SampleRadioComponent];

@NgModule({
  declarations: [SampleComponent, COMPONENTS],
  imports: [SampleRoutingModule, CommonModule, FormsModule, SharedModule],
  providers: [],
})
export class SampleModule {}
