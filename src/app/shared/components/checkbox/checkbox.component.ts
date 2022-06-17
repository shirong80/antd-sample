import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  forwardRef,
  Input,
  NgZone,
  OnDestroy,
  OnInit,
  Optional,
  Output,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { FocusMonitor } from '@angular/cdk/a11y';
import { Direction, Directionality } from '@angular/cdk/bidi';
import { fromEvent, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import {
  BooleanInput,
  NzSafeAny,
  OnChangeType,
  OnTouchedType,
} from 'ng-zorro-antd/core/types';
import { InputBoolean } from 'ng-zorro-antd/core/util';

import { NzCheckboxWrapperComponent } from './checkbox-wrapper.component';

@Component({
  selector: '[nz-checkbox]',
  exportAs: 'nzCheckbox',
  preserveWhitespaces: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  templateUrl: './checkbox.component.html',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => NzCheckboxComponent),
      multi: true,
    },
  ],
  host: {
    class: 'wise-checkbox-wrapper',
    '[class.wise-checkbox-wrapper-checked]': 'nzChecked',
    '[class.wise-checkbox-rtl]': `dir === 'rtl'`,
  },
})
export class NzCheckboxComponent
  implements OnInit, ControlValueAccessor, OnDestroy, AfterViewInit
{
  static ngAcceptInputType_nzAutoFocus: BooleanInput;
  static ngAcceptInputType_nzDisabled: BooleanInput;
  static ngAcceptInputType_nzIndeterminate: BooleanInput;
  static ngAcceptInputType_nzChecked: BooleanInput;

  dir: Direction = 'ltr';
  private destroy$ = new Subject<void>();

  onChange: OnChangeType = () => {};
  onTouched: OnTouchedType = () => {};
  // 인풋엘리먼트 레퍼런스
  @ViewChild('inputElement', { static: true }) inputElement!: ElementRef<HTMLInputElement>;
  @Output() readonly nzCheckedChange = new EventEmitter<boolean>();
  @Input() nzValue: NzSafeAny | null = null;
  @Input() @InputBoolean() nzAutoFocus = false;
  @Input() @InputBoolean() nzDisabled = false;
  @Input() @InputBoolean() nzIndeterminate = false;
  @Input() @InputBoolean() nzChecked = false;
  @Input() nzId: string | null = null;

  /**
   * input[type=checkbox] 변경시 호출
   * @param checked
   */
  innerCheckedChange(checked: boolean): void {
    if (!this.nzDisabled) {
      this.nzChecked = checked;
      this.onChange(this.nzChecked);
      this.nzCheckedChange.emit(this.nzChecked);
      // nz-checkbox-wrapper 엘리먼트에 감싸져 있을 경우 - wrapper 컴포넌트의 onChange() 호출
      if (this.nzCheckboxWrapperComponent) {
        this.nzCheckboxWrapperComponent.onChange();
      }
    }
  }

  writeValue(value: boolean): void {
    // ? nz-checkbox 컴포넌트가 자체적으로 가지고 있는 ngModel 의 값은 boolean 타입이다.
    this.nzChecked = value;
    this.cdr.markForCheck();
  }

  registerOnChange(fn: OnChangeType): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: OnTouchedType): void {
    this.onTouched = fn;
  }

  setDisabledState(disabled: boolean): void {
    this.nzDisabled = disabled;
    this.cdr.markForCheck();
  }

  focus(): void {
    this.focusMonitor.focusVia(this.inputElement, 'keyboard');
  }

  blur(): void {
    this.inputElement.nativeElement.blur();
  }

  constructor(
    private ngZone: NgZone,
    private elementRef: ElementRef<HTMLElement>,
    @Optional() private nzCheckboxWrapperComponent: NzCheckboxWrapperComponent,
    private cdr: ChangeDetectorRef,
    private focusMonitor: FocusMonitor,
    @Optional() private directionality: Directionality,
  ) {}

  ngOnInit(): void {
    this.focusMonitor
      .monitor(this.elementRef, true)
      .pipe(takeUntil(this.destroy$))
      .subscribe((focusOrigin) => {
        if (!focusOrigin) {
          Promise.resolve().then(() => this.onTouched());
        }
      });
    // * nz-checkbox-wrapper 엘리먼트에 감싸져 있을 경우 - wrapper 컴포넌트의 checkboxList에 현재 컴포넌트를 추가
    if (this.nzCheckboxWrapperComponent) {
      this.nzCheckboxWrapperComponent.addCheckbox(this);
    }

    this.directionality.change
      .pipe(takeUntil(this.destroy$))
      .subscribe((direction: Direction) => {
        this.dir = direction;
        this.cdr.detectChanges();
      });

    this.dir = this.directionality.value;

    this.ngZone.runOutsideAngular(() => {
      fromEvent(this.elementRef.nativeElement, 'click')
        .pipe(takeUntil(this.destroy$))
        .subscribe((event) => {
          event.preventDefault();
          this.focus();
          if (this.nzDisabled) {
            return;
          }
          this.ngZone.run(() => {
            this.innerCheckedChange(!this.nzChecked);
            this.cdr.markForCheck();
          });
        });

      // ! input[type=checkbox] 엘리먼트의 클릭이벤트를 금지시킨다. host 엘리먼트의 클릭이벤트로 대체한다.
      fromEvent(this.inputElement.nativeElement, 'click')
        .pipe(takeUntil(this.destroy$))
        .subscribe((event) => event.stopPropagation());
    });
  }

  ngAfterViewInit(): void {
    if (this.nzAutoFocus) {
      this.focus();
    }
  }

  ngOnDestroy(): void {
    this.focusMonitor.stopMonitoring(this.elementRef);
    // * nz-checkbox-wrapper 엘리먼트에 감싸져 있을 경우 - wrapper 컴포넌트의 checkboxList에 현재 컴포넌트를 제거
    if (this.nzCheckboxWrapperComponent) {
      this.nzCheckboxWrapperComponent.removeCheckbox(this);
    }

    this.destroy$.next();
    this.destroy$.complete();
  }
}
