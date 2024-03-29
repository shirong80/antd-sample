import { Direction, Directionality } from '@angular/cdk/bidi';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  forwardRef,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Optional,
  SimpleChanges,
  ViewEncapsulation,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import {
  BooleanInput,
  NzSafeAny,
  NzSizeLDSType,
  OnChangeType,
  OnTouchedType,
} from 'ng-zorro-antd/core/types';
import { InputBoolean } from 'ng-zorro-antd/core/util';

import { NzRadioService } from './radio.service';

export type NzRadioButtonStyle = 'outline' | 'solid';

@Component({
  selector: 'nz-radio-group',
  exportAs: 'nzRadioGroup',
  preserveWhitespaces: false,
  template: ` <ng-content></ng-content> `,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    NzRadioService,
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => NzRadioGroupComponent),
      multi: true,
    },
  ],
  host: {
    class: 'ant-radio-group',
    '[class.wise-radio-group-large]': `nzSize === 'large'`,
    '[class.wise-radio-group-small]': `nzSize === 'small'`,
    '[class.wise-radio-group-solid]': `nzButtonStyle === 'solid'`,
    '[class.wise-radio-group-rtl]': `dir === 'rtl'`,
  },
})
export class NzRadioGroupComponent
  implements OnInit, ControlValueAccessor, OnDestroy, OnChanges
{
  static ngAcceptInputType_nzDisabled: BooleanInput;

  private value: NzSafeAny | null = null;
  private destroy$ = new Subject<void>();
  onChange: OnChangeType = () => {};
  onTouched: OnTouchedType = () => {};
  @Input() @InputBoolean() nzDisabled = false;
  @Input() nzButtonStyle: NzRadioButtonStyle = 'outline';
  @Input() nzSize: NzSizeLDSType = 'default';
  @Input() nzName: string | null = null;

  dir: Direction = 'ltr';

  constructor(
    private cdr: ChangeDetectorRef,
    private nzRadioService: NzRadioService,
    @Optional() private directionality: Directionality
  ) {}

  ngOnInit(): void {
    this.nzRadioService.selected$
      .pipe(takeUntil(this.destroy$))
      .subscribe((value) => {
        // 동기화 호출.
        if (this.value !== value) {
          this.value = value;
          this.onChange(this.value);
        }
      });
    this.nzRadioService.touched$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        // 비동기화 호출. -> 해당 콜백을 Micro task queue 에 등록하기 위하여?
        Promise.resolve().then(() => this.onTouched());
      });

    this.directionality.change
      ?.pipe(takeUntil(this.destroy$))
      .subscribe((direction: Direction) => {
        this.dir = direction;
        this.cdr.detectChanges();
      });

    this.dir = this.directionality.value;
  }

  ngOnChanges(changes: SimpleChanges): void {
    const { nzDisabled, nzName } = changes;
    if (nzDisabled) {
      this.nzRadioService.setDisabled(this.nzDisabled);
    }
    if (nzName) {
      this.nzRadioService.setName(this.nzName!);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  writeValue(value: NzSafeAny): void {
    this.value = value;
    this.nzRadioService.select(value);
    this.cdr.markForCheck();
  }

  registerOnChange(fn: OnChangeType): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: OnTouchedType): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.nzDisabled = isDisabled;
    this.nzRadioService.setDisabled(isDisabled);
    this.cdr.markForCheck();
  }
}
