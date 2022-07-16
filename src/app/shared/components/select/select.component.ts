import { FocusMonitor } from '@angular/cdk/a11y';
import { Direction, Directionality } from '@angular/cdk/bidi';
import { DOWN_ARROW, ENTER, ESCAPE, SPACE, TAB, UP_ARROW } from '@angular/cdk/keycodes';
import {
  CdkConnectedOverlay,
  CdkOverlayOrigin,
  ConnectedOverlayPositionChange,
} from '@angular/cdk/overlay';
import { Platform } from '@angular/cdk/platform';
import {
  AfterContentInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ContentChildren,
  ElementRef,
  EventEmitter,
  forwardRef,
  Host,
  Input,
  NgZone,
  OnChanges,
  OnDestroy,
  OnInit,
  Optional,
  Output,
  QueryList,
  Renderer2,
  SimpleChanges,
  TemplateRef,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { BehaviorSubject, combineLatest, fromEvent, merge } from 'rxjs';
import { startWith, switchMap, takeUntil } from 'rxjs/operators';

import { slideMotion } from 'ng-zorro-antd/core/animation';
import { NzConfigKey, NzConfigService, WithConfig } from 'ng-zorro-antd/core/config';
import { NzNoAnimationDirective } from 'ng-zorro-antd/core/no-animation';
import { cancelRequestAnimationFrame, reqAnimFrame } from 'ng-zorro-antd/core/polyfill';
import { NzDestroyService } from 'ng-zorro-antd/core/services';
import {
  BooleanInput,
  NgClassInterface,
  NzSafeAny,
  OnChangeType,
  OnTouchedType,
} from 'ng-zorro-antd/core/types';
import { InputBoolean, isNotNil } from 'ng-zorro-antd/core/util';

import { NzOptionGroupComponent } from './option-group/option-group.component';
import { NzOptionComponent } from './option/option.component';
import { NzSelectTopControlComponent } from './select-top-control/select-top-control.component';
import {
  NzFilterOptionType,
  NzSelectItemInterface,
  NzSelectModeType,
  NzSelectOptionInterface,
} from './select.types';

const defaultFilterOption: NzFilterOptionType = (
  searchValue: string,
  item: NzSelectItemInterface,
): boolean => {
  if (item && item.nzLabel) {
    return item.nzLabel.toString().toLowerCase().indexOf(searchValue.toLowerCase()) > -1;
  } else {
    return false;
  }
};

const NZ_CONFIG_MODULE_NAME: NzConfigKey = 'select';

export type NzSelectSizeType = 'large' | 'default' | 'small';

@Component({
  selector: 'nz-select',
  exportAs: 'nzSelect',
  preserveWhitespaces: false,
  providers: [
    NzDestroyService,
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => NzSelectComponent),
      multi: true,
    },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  animations: [slideMotion],
  templateUrl: './select.component.html',
  host: {
    class: 'wise-select',
    '[class.wise-select-lg]': 'nzSize === "large"',
    '[class.wise-select-sm]': 'nzSize === "small"',
    '[class.wise-select-show-arrow]': `nzShowArrow`,
    '[class.wise-select-disabled]': 'nzDisabled',
    '[class.wise-select-show-search]': `(nzShowSearch || nzMode !== 'default') && !nzDisabled`,
    '[class.wise-select-allow-clear]': 'nzAllowClear',
    '[class.wise-select-borderless]': 'nzBorderless',
    '[class.wise-select-open]': 'nzOpen',
    '[class.wise-select-focused]': 'nzOpen || focused',
    '[class.wise-select-single]': `nzMode === 'default'`,
    '[class.wise-select-multiple]': `nzMode !== 'default'`,
    '[class.wise-select-rtl]': `dir === 'rtl'`,
  },
})
export class NzSelectComponent
  implements ControlValueAccessor, OnInit, AfterContentInit, OnChanges, OnDestroy
{
  readonly _nzModuleName: NzConfigKey = NZ_CONFIG_MODULE_NAME;

  static ngAcceptInputType_nzAllowClear: BooleanInput;
  static ngAcceptInputType_nzBorderless: BooleanInput;
  static ngAcceptInputType_nzShowSearch: BooleanInput;
  static ngAcceptInputType_nzLoading: BooleanInput;
  static ngAcceptInputType_nzAutoFocus: BooleanInput;
  static ngAcceptInputType_nzAutoClearSearchValue: BooleanInput;
  static ngAcceptInputType_nzServerSearch: BooleanInput;
  static ngAcceptInputType_nzDisabled: BooleanInput;
  static ngAcceptInputType_nzOpen: BooleanInput;

  @Input() nzId: string | null = null;
  @Input() nzSize: NzSelectSizeType = 'default';
  @Input() nzOptionHeightPx = 32;
  @Input() nzOptionOverflowSize = 8;
  @Input() nzDropdownClassName: string | null = null;
  @Input() nzDropdownMatchSelectWidth = true;
  @Input() nzDropdownStyle: { [key: string]: string } | null = null;
  @Input() nzNotFoundContent: string | TemplateRef<NzSafeAny> | undefined = undefined;
  @Input() nzPlaceHolder: string | TemplateRef<NzSafeAny> | null = null;
  @Input() nzMaxTagCount = Infinity;
  @Input() nzDropdownRender: TemplateRef<NzSafeAny> | null = null;
  @Input() nzCustomTemplate: TemplateRef<{
    $implicit: NzSelectItemInterface;
  }> | null = null;
  // ? WithConfig 데코레이터는 Input() 값이 없을 경우 NzConfig 에 등록된 기본값을 세팅해준다.
  // ? NzConfig 에 등록된 기본값은 NzConfigService 를 통해서 받아오거나 세팅할수 있다.
  @Input() @WithConfig<TemplateRef<NzSafeAny> | string | null>() nzSuffixIcon:
    | TemplateRef<NzSafeAny>
    | string
    | null = null;
  @Input() nzClearIcon: TemplateRef<NzSafeAny> | null = null;
  @Input() nzRemoveIcon: TemplateRef<NzSafeAny> | null = null;
  @Input() nzMenuItemSelectedIcon: TemplateRef<NzSafeAny> | null = null;
  @Input() nzTokenSeparators: string[] = [];
  @Input() nzMaxTagPlaceholder: TemplateRef<{ $implicit: NzSafeAny[] }> | null = null;
  @Input() nzMaxMultipleCount = Infinity;
  @Input() nzMode: NzSelectModeType = 'default';
  @Input() nzFilterOption: NzFilterOptionType = defaultFilterOption;
  @Input() compareWith: (o1: NzSafeAny, o2: NzSafeAny) => boolean = (
    o1: NzSafeAny,
    o2: NzSafeAny,
  ) => o1 === o2;
  @Input() @InputBoolean() nzAllowClear = false;
  @Input() @WithConfig<boolean>() @InputBoolean() nzBorderless = false;
  @Input() @InputBoolean() nzShowSearch = false;
  @Input() @InputBoolean() nzLoading = false;
  @Input() @InputBoolean() nzAutoFocus = false;
  @Input() @InputBoolean() nzAutoClearSearchValue = true;
  @Input() @InputBoolean() nzServerSearch = false;
  @Input() @InputBoolean() nzDisabled = false;
  @Input() @InputBoolean() nzOpen = false;
  @Input() @WithConfig<boolean>() @InputBoolean() nzBackdrop = false;
  @Input() nzOptions: NzSelectOptionInterface[] = [];

  @Input()
  set nzShowArrow(value: boolean) {
    this._nzShowArrow = value;
  }
  get nzShowArrow(): boolean {
    return this._nzShowArrow === undefined ? this.nzMode === 'default' : this._nzShowArrow;
  }

  @Output() readonly nzOnSearch = new EventEmitter<string>();
  @Output() readonly nzScrollToBottom = new EventEmitter<void>();
  @Output() readonly nzOpenChange = new EventEmitter<boolean>();
  @Output() readonly nzBlur = new EventEmitter<void>();
  @Output() readonly nzFocus = new EventEmitter<void>();
  @ViewChild(CdkOverlayOrigin, { static: true, read: ElementRef })
  originElement!: ElementRef;
  @ViewChild(CdkConnectedOverlay, { static: true })
  cdkConnectedOverlay!: CdkConnectedOverlay;
  @ViewChild(NzSelectTopControlComponent, { static: true })
  nzSelectTopControlComponent!: NzSelectTopControlComponent;
  @ContentChildren(NzOptionComponent, { descendants: true })
  listOfNzOptionComponent!: QueryList<NzOptionComponent>;
  @ContentChildren(NzOptionGroupComponent, { descendants: true })
  listOfNzOptionGroupComponent!: QueryList<NzOptionGroupComponent>;
  @ViewChild(NzOptionGroupComponent, { static: true, read: ElementRef })
  nzOptionGroupComponentElement!: ElementRef;
  @ViewChild(NzSelectTopControlComponent, { static: true, read: ElementRef })
  nzSelectTopControlComponentElement!: ElementRef;
  private listOfValue$ = new BehaviorSubject<NzSafeAny[]>([]);
  private listOfTemplateItem$ = new BehaviorSubject<NzSelectItemInterface[]>([]);
  private listOfTagAndTemplateItem: NzSelectItemInterface[] = [];
  private searchValue: string = '';
  private isReactiveDriven = false;
  private value: NzSafeAny | NzSafeAny[];
  private _nzShowArrow: boolean | undefined;
  private requestId: number = -1;
  onChange: OnChangeType = () => {};
  onTouched: OnTouchedType = () => {};
  dropDownPosition: 'top' | 'center' | 'bottom' = 'bottom';
  triggerWidth: number | null = null;
  listOfContainerItem: NzSelectItemInterface[] = [];
  listOfTopItem: NzSelectItemInterface[] = [];
  activatedValue: NzSafeAny | null = null;
  listOfValue: NzSafeAny[] = [];
  focused = false;
  dir: Direction = 'ltr';

  // status
  prefixCls: string = 'wise-select';
  statusCls: NgClassInterface = {};
  hasFeedback: boolean = false;

  /**
   * * tags 모드에서 신규 입력된 값을 NzSelectItemInterface 에 맞게 전환하는 함수.
   * @param value -> 사용자가 입력한 스트링
   */
  generateTagItem(value: string): NzSelectItemInterface {
    return {
      nzValue: value,
      nzLabel: value,
      type: 'item',
    };
  }

  /**
   * * 옵션 클릭시 호출되는 함수
   * @param value -> 사용자가 클릭한 옵션
   */
  onItemClick(value: NzSafeAny): void {
    this.activatedValue = value;
    if (this.nzMode === 'default') {
      if (this.listOfValue.length === 0 || !this.compareWith(this.listOfValue[0], value)) {
        this.updateListOfValue([value]);
      }
      this.setOpenState(false);
    } else {
      const targetIndex = this.listOfValue.findIndex((o) => this.compareWith(o, value));
      if (targetIndex !== -1) {
        const listOfValueAfterRemoved = this.listOfValue.filter((_, i) => i !== targetIndex);
        this.updateListOfValue(listOfValueAfterRemoved);
      } else if (this.listOfValue.length < this.nzMaxMultipleCount) {
        const listOfValueAfterAdded = [...this.listOfValue, value];
        this.updateListOfValue(listOfValueAfterAdded);
      }
      this.focus();
      if (this.nzAutoClearSearchValue) {
        this.clearInput();
      }
    }
  }

  /**
   * * multiple, tags 모드에서 선택된 아이템을 지울때 호출되는 함수
   * @param item -> 삭제할려는 아이템
   */
  onItemDelete(item: NzSelectItemInterface): void {
    const listOfSelectedValue = this.listOfValue.filter(
      (v) => !this.compareWith(v, item.nzValue),
    );
    this.updateListOfValue(listOfSelectedValue);
    this.clearInput();
  }

  /**
   * * listOfContainerItem 을 최종적으로 조합하는 함수.
   * ? listOfContainerItem 은 option-container 에 넘겨지는 데이터.
   */
  updateListOfContainerItem(): void {
    let listOfContainerItem = this.listOfTagAndTemplateItem
      .filter((item) => !item.nzHide)
      .filter((item) => {
        if (!this.nzServerSearch && this.searchValue) {
          return this.nzFilterOption(this.searchValue, item);
        } else {
          return true;
        }
      });
    if (this.nzMode === 'tags' && this.searchValue) {
      const matchedItem = this.listOfTagAndTemplateItem.find(
        (item) => item.nzLabel === this.searchValue,
      );
      if (!matchedItem) {
        const tagItem = this.generateTagItem(this.searchValue);
        listOfContainerItem = [tagItem, ...listOfContainerItem];
        this.activatedValue = tagItem.nzValue;
      } else {
        this.activatedValue = matchedItem.nzValue;
      }
    }
    const activatedItem =
      listOfContainerItem.find((item) => item.nzLabel === this.searchValue) ||
      listOfContainerItem.find((item) =>
        this.compareWith(item.nzValue, this.listOfValue[0]),
      ) ||
      listOfContainerItem[0];
    this.activatedValue = (activatedItem && activatedItem.nzValue) || null;
    let listOfGroupLabel: Array<string | number | TemplateRef<NzSafeAny> | null> = [];
    if (this.isReactiveDriven) {
      listOfGroupLabel = [
        ...new Set(this.nzOptions.filter((o) => o.groupLabel).map((o) => o.groupLabel!)),
      ];
    } else {
      if (this.listOfNzOptionGroupComponent) {
        listOfGroupLabel = this.listOfNzOptionGroupComponent.map((o) => o.nzLabel);
      }
    }
    /** insert group item **/
    listOfGroupLabel.forEach((label) => {
      const index = listOfContainerItem.findIndex((item) => label === item.groupLabel);
      if (index > -1) {
        const groupItem = {
          groupLabel: label,
          type: 'group',
          key: label,
        } as NzSelectItemInterface;
        listOfContainerItem.splice(index, 0, groupItem);
      }
    });
    this.listOfContainerItem = [...listOfContainerItem];
    this.updateCdkConnectedOverlayPositions();
  }

  clearInput(): void {
    this.nzSelectTopControlComponent.clearInputValue();
  }

  /**
   * * 선택된 값들을 업데이트 하는 함수
   * ? this.value, ngModel 을 최종적으로 업데이트 하는 로직이 있다.
   * @param listOfValue -> 선택된 값들
   */
  updateListOfValue(listOfValue: NzSafeAny[]): void {
    const covertListToModel = (
      list: NzSafeAny[],
      mode: NzSelectModeType,
    ): NzSafeAny[] | NzSafeAny => {
      if (mode === 'default') {
        if (list.length > 0) {
          return list[0];
        } else {
          return null;
        }
      } else {
        return list;
      }
    };
    const model = covertListToModel(listOfValue, this.nzMode);
    if (this.value !== model) {
      this.listOfValue = listOfValue;
      this.listOfValue$.next(listOfValue);
      this.value = model;
      this.onChange(this.value);
    }
  }

  onTokenSeparate(listOfLabel: string[]): void {
    const listOfMatchedValue = this.listOfTagAndTemplateItem
      .filter((item) => listOfLabel.findIndex((label) => label === item.nzLabel) !== -1)
      .map((item) => item.nzValue)
      .filter((item) => this.listOfValue.findIndex((v) => this.compareWith(v, item)) === -1);
    if (this.nzMode === 'multiple') {
      this.updateListOfValue([...this.listOfValue, ...listOfMatchedValue]);
    } else if (this.nzMode === 'tags') {
      const listOfUnMatchedLabel = listOfLabel.filter(
        (label) =>
          this.listOfTagAndTemplateItem.findIndex((item) => item.nzLabel === label) === -1,
      );
      this.updateListOfValue([
        ...this.listOfValue,
        ...listOfMatchedValue,
        ...listOfUnMatchedLabel,
      ]);
    }
    this.clearInput();
  }

  onKeyDown(e: KeyboardEvent): void {
    if (this.nzDisabled) {
      return;
    }
    const listOfFilteredOptionNotDisabled = this.listOfContainerItem
      .filter((item) => item.type === 'item')
      .filter((item) => !item.nzDisabled);
    const activatedIndex = listOfFilteredOptionNotDisabled.findIndex((item) =>
      this.compareWith(item.nzValue, this.activatedValue),
    );
    switch (e.keyCode) {
      case UP_ARROW:
        e.preventDefault();
        if (this.nzOpen && listOfFilteredOptionNotDisabled.length > 0) {
          const preIndex =
            activatedIndex > 0
              ? activatedIndex - 1
              : listOfFilteredOptionNotDisabled.length - 1;
          this.activatedValue = listOfFilteredOptionNotDisabled[preIndex].nzValue;
        }
        break;
      case DOWN_ARROW:
        e.preventDefault();
        if (this.nzOpen && listOfFilteredOptionNotDisabled.length > 0) {
          const nextIndex =
            activatedIndex < listOfFilteredOptionNotDisabled.length - 1
              ? activatedIndex + 1
              : 0;
          this.activatedValue = listOfFilteredOptionNotDisabled[nextIndex].nzValue;
        } else {
          this.setOpenState(true);
        }
        break;
      case ENTER:
        e.preventDefault();
        if (this.nzOpen) {
          if (isNotNil(this.activatedValue)) {
            this.onItemClick(this.activatedValue);
          }
        } else {
          this.setOpenState(true);
        }
        break;
      case SPACE:
        if (!this.nzOpen) {
          this.setOpenState(true);
          e.preventDefault();
        }
        break;
      case TAB:
        this.setOpenState(false);
        break;
      case ESCAPE:
        /**
         * Skip the ESCAPE processing, it will be handled in {@link onOverlayKeyDown}.
         */
        break;
      default:
        if (!this.nzOpen) {
          this.setOpenState(true);
        }
    }
  }

  setOpenState(value: boolean): void {
    if (this.nzOpen !== value) {
      this.nzOpen = value;
      this.nzOpenChange.emit(value);
      this.onOpenChange();
      this.cdr.markForCheck();
    }
  }

  onOpenChange(): void {
    this.updateCdkConnectedOverlayStatus();
    this.clearInput();
  }

  onInputValueChange(value: string): void {
    this.searchValue = value;
    this.updateListOfContainerItem();
    this.nzOnSearch.emit(value);
    this.updateCdkConnectedOverlayPositions();
  }

  onClearSelection(): void {
    this.updateListOfValue([]);
  }

  onClickOutside(event: MouseEvent): void {
    if (!this.host.nativeElement.contains(event.target as HTMLElement)) {
      this.setOpenState(false);
    }
  }

  focus(): void {
    this.nzSelectTopControlComponent.focus();
  }

  blur(): void {
    this.nzSelectTopControlComponent.blur();
  }

  onPositionChange(position: ConnectedOverlayPositionChange): void {
    this.dropDownPosition = position.connectionPair.originY;
  }

  updateCdkConnectedOverlayStatus(): void {
    if (this.platform.isBrowser && this.originElement.nativeElement) {
      const triggerWidth = this.triggerWidth;
      cancelRequestAnimationFrame(this.requestId);
      // ? 드롭다운을 부드럽게 표현하기 위해서 requestAnimationFrame 을 사용한다.
      this.requestId = reqAnimFrame(() => {
        // Blink triggers style and layout pipelines anytime the `getBoundingClientRect()` is called, which may cause a
        // frame drop. That's why it's scheduled through the `requestAnimationFrame` to unload the composite thread.
        this.triggerWidth = this.originElement.nativeElement.getBoundingClientRect().width;
        if (triggerWidth !== this.triggerWidth) {
          // The `requestAnimationFrame` will trigger change detection, but we're inside an `OnPush` component which won't have
          // the `ChecksEnabled` state. Calling `markForCheck()` will allow Angular to run the change detection from the root component
          // down to the `nz-select`. But we'll trigger only local change detection if the `triggerWidth` has been changed.
          this.cdr.detectChanges();
        }
      });
    }
  }

  updateCdkConnectedOverlayPositions(): void {
    reqAnimFrame(() => {
      this.cdkConnectedOverlay?.overlayRef?.updatePosition();
    });
  }

  constructor(
    private ngZone: NgZone,
    private destroy$: NzDestroyService,
    public nzConfigService: NzConfigService,
    private cdr: ChangeDetectorRef,
    private host: ElementRef<HTMLElement>,
    private renderer: Renderer2,
    private platform: Platform,
    private focusMonitor: FocusMonitor,
    @Optional() private directionality: Directionality,
    @Host() @Optional() public noAnimation?: NzNoAnimationDirective,
  ) {}

  writeValue(modelValue: NzSafeAny | NzSafeAny[]): void {
    /** https://github.com/angular/angular/issues/14988 **/
    if (this.value !== modelValue) {
      this.value = modelValue;
      const covertModelToList = (
        model: NzSafeAny[] | NzSafeAny,
        mode: NzSelectModeType,
      ): NzSafeAny[] => {
        if (model === null || model === undefined) {
          return [];
        } else if (mode === 'default') {
          return [model];
        } else {
          return model;
        }
      };
      const listOfValue = covertModelToList(modelValue, this.nzMode);
      this.listOfValue = listOfValue;
      this.listOfValue$.next(listOfValue);
      this.cdr.markForCheck();
    }
  }

  registerOnChange(fn: OnChangeType): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: OnTouchedType): void {
    this.onTouched = fn;
  }

  setDisabledState(disabled: boolean): void {
    this.nzDisabled = disabled;
    if (disabled) {
      this.setOpenState(false);
    }
    this.cdr.markForCheck();
  }

  ngOnChanges(changes: SimpleChanges): void {
    const { nzOpen, nzDisabled, nzOptions, nzStatus } = changes;
    if (nzOpen) {
      this.onOpenChange();
    }
    if (nzDisabled && this.nzDisabled) {
      this.setOpenState(false);
    }
    if (nzOptions) {
      this.isReactiveDriven = true;
      const listOfOptions = this.nzOptions || [];
      const listOfTransformedItem = listOfOptions.map((item) => {
        return {
          template: item.label instanceof TemplateRef ? item.label : null,
          nzLabel:
            typeof item.label === 'string' || typeof item.label === 'number'
              ? item.label
              : null,
          nzValue: item.value,
          nzDisabled: item.disabled || false,
          nzHide: item.hide || false,
          nzCustomContent: item.label instanceof TemplateRef,
          groupLabel: item.groupLabel || null,
          type: 'item',
          key: item.value,
        };
      });
      this.listOfTemplateItem$.next(listOfTransformedItem);
    }
    // if (nzStatus) {
    //   this.setStatusStyles();
    // }
  }

  ngOnInit(): void {
    this.focusMonitor
      .monitor(this.host, true)
      .pipe(takeUntil(this.destroy$))
      .subscribe((focusOrigin) => {
        if (!focusOrigin) {
          this.focused = false;
          this.cdr.markForCheck();
          this.nzBlur.emit();
          Promise.resolve().then(() => {
            this.onTouched();
          });
        } else {
          this.focused = true;
          this.cdr.markForCheck();
          this.nzFocus.emit();
        }
      });
    combineLatest([this.listOfValue$, this.listOfTemplateItem$])
      .pipe(takeUntil(this.destroy$))
      .subscribe(([listOfSelectedValue, listOfTemplateItem]) => {
        // * tags 모드일 경우, 선택된 항목들을 NzSelectItemInterface[] 타입으로 가공
        const listOfTagItem = listOfSelectedValue
          .filter(() => this.nzMode === 'tags')
          .filter(
            (value) =>
              listOfTemplateItem.findIndex((o) => this.compareWith(o.nzValue, value)) === -1,
          )
          .map(
            (value) =>
              this.listOfTopItem.find((o) => this.compareWith(o.nzValue, value)) ||
              this.generateTagItem(value),
          );
        // * listOfTagAndTemplateItem 값을 세팅
        this.listOfTagAndTemplateItem = [...listOfTemplateItem, ...listOfTagItem];
        // * listOfTopItem 값을 세팅
        this.listOfTopItem = this.listOfValue
          .map(
            (v) =>
              [...this.listOfTagAndTemplateItem, ...this.listOfTopItem].find((item) =>
                this.compareWith(v, item.nzValue),
              )!,
          )
          .filter((item) => !!item);
        this.updateListOfContainerItem();
      });

    this.directionality.change
      ?.pipe(takeUntil(this.destroy$))
      .subscribe((direction: Direction) => {
        this.dir = direction;
        this.cdr.detectChanges();
      });

    this.nzConfigService
      .getConfigChangeEventForComponent('select')
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.cdr.markForCheck();
      });

    this.dir = this.directionality.value;

    this.ngZone.runOutsideAngular(() =>
      fromEvent(this.host.nativeElement, 'click')
        .pipe(takeUntil(this.destroy$))
        .subscribe(() => {
          if ((this.nzOpen && this.nzShowSearch) || this.nzDisabled) {
            return;
          }

          this.ngZone.run(() => this.setOpenState(!this.nzOpen));
        }),
    );

    // Caretaker note: we could've added this listener within the template `(overlayKeydown)="..."`,
    // but with this approach, it'll run change detection on each keyboard click, and also it'll run
    // `markForCheck()` internally, which means the whole component tree (starting from the root and
    // going down to the select component) will be re-checked and updated (if needed).
    // This is safe to do that manually since `setOpenState()` calls `markForCheck()` if needed.
    this.cdkConnectedOverlay.overlayKeydown
      .pipe(takeUntil(this.destroy$))
      .subscribe((event) => {
        if (event.keyCode === ESCAPE) {
          this.setOpenState(false);
        }
      });
  }

  ngAfterContentInit(): void {
    if (!this.isReactiveDriven) {
      merge(this.listOfNzOptionGroupComponent.changes, this.listOfNzOptionComponent.changes)
        .pipe(
          startWith(true),
          switchMap(() =>
            merge(
              // ? listOfComponent 전체에 변화가 발생하거나,
              // ? list 에 들어있는 옵션중에 하나라도 변화가 발생하거나 하면,
              // ? this.listOfTemplateItem$ 변수를 업데이트 시킨다.
              ...[
                this.listOfNzOptionComponent.changes,
                this.listOfNzOptionGroupComponent.changes,
                ...this.listOfNzOptionComponent.map((option) => option.changes),
                ...this.listOfNzOptionGroupComponent.map((option) => option.changes),
              ],
            ).pipe(startWith(true)),
          ),
          takeUntil(this.destroy$),
        )
        .subscribe(() => {
          const listOfOptionInterface = this.listOfNzOptionComponent.toArray().map((item) => {
            const {
              template,
              nzLabel,
              nzValue,
              nzDisabled,
              nzHide,
              nzCustomContent,
              groupLabel,
            } = item;
            return {
              template,
              nzLabel,
              nzValue,
              nzDisabled,
              nzHide,
              nzCustomContent,
              groupLabel,
              type: 'item',
              key: nzValue,
            };
          });
          this.listOfTemplateItem$.next(listOfOptionInterface);
          this.cdr.markForCheck();
        });
    }
  }

  ngOnDestroy(): void {
    cancelRequestAnimationFrame(this.requestId);
    this.focusMonitor.stopMonitoring(this.host);
  }

  // private setStatusStyles(): void {
  //   // render status if nzStatus is set
  //   this.statusCls = getStatusClassNames(
  //     this.prefixCls,
  //     this.nzStatus,
  //     this.hasFeedback
  //   );
  //   Object.keys(this.statusCls).forEach((status) => {
  //     if (this.statusCls[status]) {
  //       this.renderer.addClass(this.host.nativeElement, status);
  //     } else {
  //       this.renderer.removeClass(this.host.nativeElement, status);
  //     }
  //   });
  // }
}
