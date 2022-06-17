import { Directionality } from '@angular/cdk/bidi';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Host,
  Optional,
  ViewEncapsulation,
} from '@angular/core';

import { zoomBigMotion } from 'ng-zorro-antd/core/animation';
import { isPresetColor, NzPresetColor } from 'ng-zorro-antd/core/color';
import { NzNoAnimationDirective } from 'ng-zorro-antd/core/no-animation';
import { NgStyleInterface, NzTSType } from 'ng-zorro-antd/core/types';

import { isTooltipEmpty, NzTooltipBaseComponent } from './base';

@Component({
  selector: 'nz-tooltip',
  exportAs: 'nzTooltipComponent',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  animations: [zoomBigMotion],
  templateUrl: './tooltip.component.html',
  preserveWhitespaces: false,
})
export class NzToolTipComponent extends NzTooltipBaseComponent {
  override nzTitle: NzTSType | null = null;
  nzTitleContext: Object | null = null;

  nzColor?: string | NzPresetColor;

  _contentStyleMap: NgStyleInterface = {};

  constructor(
    cdr: ChangeDetectorRef,
    @Optional() directionality: Directionality,
    @Host() @Optional() noAnimation?: NzNoAnimationDirective,
  ) {
    super(cdr, directionality, noAnimation);
  }

  protected isEmpty(): boolean {
    return isTooltipEmpty(this.nzTitle);
  }

  protected override updateStyles(): void {
    const isColorPreset = this.nzColor && isPresetColor(this.nzColor);

    this._classMap = {
      [this.nzOverlayClassName]: true,
      [`${this._prefix}-placement-${this.preferredPlacement}`]: true,
      [`${this._prefix}-${this.nzColor}`]: isColorPreset,
    };

    this._contentStyleMap = {
      backgroundColor: !!this.nzColor && !isColorPreset ? this.nzColor : null,
    };
  }
}
