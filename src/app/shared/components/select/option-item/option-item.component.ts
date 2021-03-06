import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  NgZone,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  TemplateRef,
  ViewEncapsulation,
} from '@angular/core';
import { fromEvent } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { NzDestroyService } from 'ng-zorro-antd/core/services';
import { NzSafeAny } from 'ng-zorro-antd/core/types';

@Component({
  selector: 'nz-option-item',
  templateUrl: './option-item.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    class: 'wise-select-item wise-select-item-option',
    '[attr.title]': 'label',
    '[class.wise-select-item-option-grouped]': 'grouped',
    '[class.wise-select-item-option-selected]': 'selected && !disabled',
    '[class.wise-select-item-option-disabled]': 'disabled',
    '[class.wise-select-item-option-active]': 'activated && !disabled',
  },
  providers: [NzDestroyService],
})
export class NzOptionItemComponent implements OnChanges, OnInit {
  selected = false;
  activated = false;
  @Input() grouped = false;
  @Input() customContent = false;
  @Input() template: TemplateRef<NzSafeAny> | null = null;
  @Input() disabled = false;
  @Input() showState = false;
  @Input() label: string | number | null = null;
  @Input() value: NzSafeAny | null = null;
  @Input() activatedValue: NzSafeAny | null = null;
  @Input() listOfSelectedValue: NzSafeAny[] = [];
  @Input() icon: TemplateRef<NzSafeAny> | null = null;
  @Input() compareWith!: (o1: NzSafeAny, o2: NzSafeAny) => boolean;
  @Output() readonly itemClick = new EventEmitter<NzSafeAny>();
  @Output() readonly itemHover = new EventEmitter<NzSafeAny>();

  constructor(
    private elementRef: ElementRef<HTMLElement>,
    private ngZone: NgZone,
    private destroy$: NzDestroyService
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    const { value, activatedValue, listOfSelectedValue } = changes;
    if (value || listOfSelectedValue) {
      this.selected = this.listOfSelectedValue.some((v) =>
        this.compareWith(v, this.value)
      );
    }
    if (value || activatedValue) {
      this.activated = this.compareWith(this.activatedValue, this.value);
    }
  }

  ngOnInit(): void {
    this.ngZone.runOutsideAngular(() => {
      fromEvent(this.elementRef.nativeElement, 'click')
        .pipe(takeUntil(this.destroy$))
        .subscribe(() => {
          if (!this.disabled) {
            this.ngZone.run(() => this.itemClick.emit(this.value));
          }
        });

      fromEvent(this.elementRef.nativeElement, 'mouseenter')
        .pipe(takeUntil(this.destroy$))
        .subscribe(() => {
          if (!this.disabled) {
            this.ngZone.run(() => this.itemHover.emit(this.value));
          }
        });
    });
  }
}
