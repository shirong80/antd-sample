import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
  TemplateRef,
  ViewEncapsulation,
} from '@angular/core';

import { NzSafeAny } from 'ng-zorro-antd/core/types';

@Component({
  selector: 'nz-select-clear',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './select-clear.component.html',
  host: {
    class: 'wise-select-clear',
    '(click)': 'onClick($event)',
  },
})
export class NzSelectClearComponent {
  @Input() clearIcon: TemplateRef<NzSafeAny> | null = null;
  @Output() readonly clear = new EventEmitter<MouseEvent>();

  constructor() {}

  onClick(e: MouseEvent): void {
    e.preventDefault();
    e.stopPropagation();
    this.clear.emit(e);
  }
}
