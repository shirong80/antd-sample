/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import { FocusTrapFactory } from '@angular/cdk/a11y';
import { OverlayRef } from '@angular/cdk/overlay';
import { CdkPortalOutlet } from '@angular/cdk/portal';
import { DOCUMENT } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Inject,
  NgZone,
  OnInit,
  Optional,
  Renderer2,
  ViewChild,
} from '@angular/core';
import { ANIMATION_MODULE_TYPE } from '@angular/platform-browser/animations';

import { NzConfigService } from 'ng-zorro-antd/core/config';
import { NzSafeAny } from 'ng-zorro-antd/core/types';

import { nzModalAnimations } from '../modal-animations';
import { BaseModalContainerComponent } from './modal-container.directive';
import { ModalOptions } from '../modal-types';

@Component({
  selector: 'nz-modal-container',
  exportAs: 'nzModalContainer',
  templateUrl: './modal-container.component.html',
  animations: [nzModalAnimations.modalContainer],
  // Using OnPush for modal caused footer can not to detect changes. we can fix it when 8.x.
  changeDetection: ChangeDetectionStrategy.Default,
  host: {
    tabindex: '-1',
    role: 'dialog',
    '[class]':
      'config.nzWrapClassName ? "wise-modal-wrap " + config.nzWrapClassName : "wise-modal-wrap"',
    '[class.wise-modal-wrap-rtl]': `dir === 'rtl'`,
    '[class.wise-modal-centered]': 'config.nzCentered',
    '[style.zIndex]': 'config.nzZIndex',
    '[@.disabled]': 'config.nzNoAnimation',
    '[@modalContainer]': 'state',
    '(@modalContainer.start)': 'onAnimationStart($event)',
    '(@modalContainer.done)': 'onAnimationDone($event)',
    '(click)': 'onContainerClick($event)',
  },
})
export class NzModalContainerComponent extends BaseModalContainerComponent implements OnInit {
  @ViewChild(CdkPortalOutlet, { static: true }) override portalOutlet!: CdkPortalOutlet;
  @ViewChild('modalElement', { static: true })
  override modalElementRef!: ElementRef<HTMLDivElement>;
  constructor(
    ngZone: NgZone,
    host: ElementRef<HTMLElement>,
    focusTrapFactory: FocusTrapFactory,
    cdr: ChangeDetectorRef,
    render: Renderer2,
    overlayRef: OverlayRef,
    nzConfigService: NzConfigService,
    public override config: ModalOptions,
    @Optional() @Inject(DOCUMENT) document: NzSafeAny,
    @Optional() @Inject(ANIMATION_MODULE_TYPE) animationType: string,
  ) {
    super(
      ngZone,
      host,
      focusTrapFactory,
      cdr,
      render,
      overlayRef,
      nzConfigService,
      config,
      document,
      animationType,
    );
  }

  ngOnInit(): void {
    this.setupMouseListeners(this.modalElementRef);
  }
}
