import {
  ChangeDetectionStrategy,
  Component,
  Input,
  TemplateRef,
  ViewEncapsulation,
} from '@angular/core';

import { NzSafeAny } from 'ng-zorro-antd/core/types';

@Component({
  selector: 'nz-select-placeholder',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './select-placeholder.component.html',
  host: { class: 'wise-select-selection-placeholder' },
})
export class NzSelectPlaceholderComponent {
  @Input() placeholder: TemplateRef<NzSafeAny> | string | null = null;

  constructor() {}
}
