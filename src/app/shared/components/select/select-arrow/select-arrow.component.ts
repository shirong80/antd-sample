import {
  ChangeDetectionStrategy,
  Component,
  Input,
  TemplateRef,
  ViewEncapsulation,
} from '@angular/core';

import { NzSafeAny } from 'ng-zorro-antd/core/types';

@Component({
  selector: 'nz-select-arrow',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './select-arrow.component.html',
  host: {
    class: 'wise-select-arrow',
    '[class.wise-select-arrow-loading]': 'loading',
  },
})
export class NzSelectArrowComponent {
  @Input() loading = false;
  @Input() search = false;
  @Input() suffixIcon: TemplateRef<NzSafeAny> | string | null = null;

  constructor() {}
}
