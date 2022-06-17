import { BidiModule } from '@angular/cdk/bidi';
import { OverlayModule } from '@angular/cdk/overlay';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { NzNoAnimationModule } from 'ng-zorro-antd/core/no-animation';
import { NzOutletModule } from 'ng-zorro-antd/core/outlet';
import { NzOverlayModule } from 'ng-zorro-antd/core/overlay';

// NOTE: the `t` is not uppercase in directives. Change this would however introduce breaking change.
import { NzToolTipComponent } from './tooltip.component';
import { NzTooltipDirective } from './tooltip.directive';

@NgModule({
  declarations: [NzToolTipComponent, NzTooltipDirective],
  exports: [NzToolTipComponent, NzTooltipDirective],
  entryComponents: [NzToolTipComponent],
  imports: [
    BidiModule,
    CommonModule,
    OverlayModule,
    NzOutletModule,
    NzOverlayModule,
    NzNoAnimationModule,
  ],
})
export class NzToolTipModule {}
