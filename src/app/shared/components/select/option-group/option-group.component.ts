import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnChanges,
  TemplateRef,
  ViewEncapsulation,
} from '@angular/core';
import { Subject } from 'rxjs';

import { NzSafeAny } from 'ng-zorro-antd/core/types';

@Component({
  selector: 'nz-option-group',
  exportAs: 'nzOptionGroup',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: ` <ng-content></ng-content> `,
})
export class NzOptionGroupComponent implements OnChanges {
  @Input() nzLabel: string | number | TemplateRef<NzSafeAny> | null = null;
  changes = new Subject<void>();
  ngOnChanges(): void {
    this.changes.next();
  }
}
