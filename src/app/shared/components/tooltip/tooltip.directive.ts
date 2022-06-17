import {
  ComponentFactoryResolver,
  ComponentRef,
  Directive,
  ElementRef,
  EventEmitter,
  Host,
  Input,
  Optional,
  Output,
  Renderer2,
  ViewContainerRef,
} from '@angular/core';

import { NzNoAnimationDirective } from 'ng-zorro-antd/core/no-animation';
import { BooleanInput, NgStyleInterface, NzTSType } from 'ng-zorro-antd/core/types';
import { InputBoolean } from 'ng-zorro-antd/core/util';

import { NzTooltipBaseDirective, NzTooltipTrigger, PropertyMapping } from './base';
import { NzToolTipComponent } from './tooltip.component';

@Directive({
  selector: '[nz-tooltip]',
  exportAs: 'nzTooltip',
  host: {
    '[class.ant-tooltip-open]': 'visible',
  },
})
export class NzTooltipDirective extends NzTooltipBaseDirective {
  static ngAcceptInputType_nzTooltipArrowPointAtCenter: BooleanInput;

  @Input('nzTooltipTitle') override title?: NzTSType | null;
  @Input('nzTooltipTitleContext') titleContext?: Object | null = null;
  @Input('nz-tooltip') override directiveTitle?: NzTSType | null;
  @Input('nzTooltipTrigger') override trigger?: NzTooltipTrigger = 'hover';
  @Input('nzTooltipPlacement') override placement?: string | string[] = 'top';
  @Input('nzTooltipOrigin') override origin?: ElementRef<HTMLElement>;
  @Input('nzTooltipVisible') override visible?: boolean;
  @Input('nzTooltipMouseEnterDelay') override mouseEnterDelay?: number;
  @Input('nzTooltipMouseLeaveDelay') override mouseLeaveDelay?: number;
  @Input('nzTooltipOverlayClassName') override overlayClassName?: string;
  @Input('nzTooltipOverlayStyle') override overlayStyle?: NgStyleInterface;
  @Input('nzTooltipArrowPointAtCenter') @InputBoolean() override arrowPointAtCenter?: boolean;
  @Input() nzTooltipColor?: string;

  // eslint-disable-next-line @angular-eslint/no-output-rename
  @Output('nzTooltipVisibleChange') override readonly visibleChange =
    new EventEmitter<boolean>();

  override componentRef: ComponentRef<NzToolTipComponent> =
    this.hostView.createComponent(NzToolTipComponent);

  constructor(
    elementRef: ElementRef,
    hostView: ViewContainerRef,
    resolver: ComponentFactoryResolver,
    renderer: Renderer2,
    @Host() @Optional() noAnimation?: NzNoAnimationDirective,
  ) {
    super(elementRef, hostView, resolver, renderer, noAnimation);
  }

  protected override getProxyPropertyMap(): PropertyMapping {
    return {
      ...super.getProxyPropertyMap(),
      nzTooltipColor: ['nzColor', () => this.nzTooltipColor],
      nzTooltipTitleContext: ['nzTitleContext', () => this.titleContext],
    };
  }
}
