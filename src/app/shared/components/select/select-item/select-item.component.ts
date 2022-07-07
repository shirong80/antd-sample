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
  selector: 'nz-select-item',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './select-item.component.html',
  host: {
    class: 'wise-select-selection-item',
    '[attr.title]': 'label',
    '[class.wise-select-selection-item-disabled]': 'disabled',
  },
})
export class NzSelectItemComponent {
  @Input() disabled = false;
  @Input() label: string | number | null | undefined = null;
  @Input() deletable = false;
  @Input() removeIcon: TemplateRef<NzSafeAny> | null = null;
  @Input() contentTemplateOutletContext: NzSafeAny | null = null;
  @Input() contentTemplateOutlet: string | TemplateRef<NzSafeAny> | null = null;
  @Output() readonly delete = new EventEmitter<MouseEvent>();

  constructor() {}

  onDelete(e: MouseEvent): void {
    e.preventDefault();
    e.stopPropagation();
    if (!this.disabled) {
      this.delete.next(e);
    }
  }
}
