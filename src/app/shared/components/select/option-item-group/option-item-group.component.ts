import {
  ChangeDetectionStrategy,
  Component,
  Input,
  TemplateRef,
  ViewEncapsulation,
} from '@angular/core';

import { NzSafeAny } from 'ng-zorro-antd/core/types';

@Component({
  selector: 'nz-option-item-group',
  template: `
    <ng-container *nzStringTemplateOutlet="nzLabel">{{ nzLabel }}</ng-container>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    class: 'wise-select-item wise-select-item-group',
  },
})
export class NzOptionItemGroupComponent {
  @Input() nzLabel: string | number | TemplateRef<NzSafeAny> | null = null;

  constructor() {}
}
