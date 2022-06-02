import { A11yModule } from '@angular/cdk/a11y';
import { BidiModule } from '@angular/cdk/bidi';
import { OverlayModule } from '@angular/cdk/overlay';
import { PlatformModule } from '@angular/cdk/platform';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { NzNoAnimationModule } from 'ng-zorro-antd/core/no-animation';
import { NzOutletModule } from 'ng-zorro-antd/core/outlet';
import { NzOverlayModule } from 'ng-zorro-antd/core/overlay';
import { ɵNzTransitionPatchModule as NzTransitionPatchModule } from 'ng-zorro-antd/core/transition-patch';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzI18nModule } from 'ng-zorro-antd/i18n';
import { NzIconModule } from 'ng-zorro-antd/icon';

import { NzOptionContainerComponent } from './option-container';
import { NzOptionGroupComponent } from './option-group';
import { NzOptionItemGroupComponent } from './option-item-group';
import { NzOptionItemComponent } from './option-item';
import { NzOptionComponent } from './option';
import { NzSelectArrowComponent } from './select-arrow';
import { NzSelectClearComponent } from './select-clear';
import { NzSelectItemComponent } from './select-item';
import { NzSelectPlaceholderComponent } from './select-placeholder';
import { NzSelectSearchComponent } from './select-search';
import { NzSelectTopControlComponent } from './select-top-control';
import { NzSelectComponent } from './select.component';

@NgModule({
  imports: [
    BidiModule,
    CommonModule,
    NzI18nModule,
    FormsModule,
    PlatformModule,
    OverlayModule,
    NzIconModule,
    NzOutletModule,
    NzEmptyModule,
    NzOverlayModule,
    NzNoAnimationModule,
    NzTransitionPatchModule,
    ScrollingModule,
    A11yModule,
  ],
  declarations: [
    NzOptionComponent,
    NzSelectComponent,
    NzOptionContainerComponent,
    NzOptionGroupComponent,
    NzOptionItemComponent,
    NzSelectTopControlComponent,
    NzSelectSearchComponent,
    NzSelectItemComponent,
    NzSelectClearComponent,
    NzSelectArrowComponent,
    NzSelectPlaceholderComponent,
    NzOptionItemGroupComponent,
  ],
  exports: [
    NzOptionComponent,
    NzSelectComponent,
    NzOptionGroupComponent,
    NzSelectArrowComponent,
    NzSelectClearComponent,
    NzSelectItemComponent,
    NzSelectPlaceholderComponent,
    NzSelectSearchComponent,
  ],
})
export class NzSelectModule {}
