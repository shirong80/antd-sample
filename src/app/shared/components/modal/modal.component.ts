/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ContentChild,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges,
  TemplateRef,
  Type,
  ViewContainerRef,
} from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { NzButtonType } from 'ng-zorro-antd/button';
import { BooleanInput, NzSafeAny } from 'ng-zorro-antd/core/types';
import { InputBoolean } from 'ng-zorro-antd/core/util';

import { NzModalContentDirective } from './modal-content/modal-content.directive';
import { NzModalFooterDirective } from './modal-footer/modal-footer.directive';
import { NzModalLegacyAPI } from './modal-legacy-api';
import { NzModalRef } from './modal-ref';
import { NzModalTitleDirective } from './modal-title/modal-title.directive';
import {
  ModalButtonOptions,
  ModalOptions,
  ModalTypes,
  OnClickCallback,
  StyleObjectLike,
} from './modal-types';
import { NzModalService } from './modal.service';
import { getConfigFromComponent } from './utils';

@Component({
  selector: 'nz-modal',
  exportAs: 'nzModal',
  template: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NzModalComponent<T = NzSafeAny, R = NzSafeAny>
  implements OnChanges, NzModalLegacyAPI<T, R>, OnDestroy
{
  static ngAcceptInputType_nzMask: BooleanInput;
  static ngAcceptInputType_nzMaskClosable: BooleanInput;
  static ngAcceptInputType_nzCloseOnNavigation: BooleanInput;
  static ngAcceptInputType_nzVisible: BooleanInput;
  static ngAcceptInputType_nzClosable: BooleanInput;
  static ngAcceptInputType_nzOkLoading: BooleanInput;
  static ngAcceptInputType_nzOkDisabled: BooleanInput;
  static ngAcceptInputType_nzCancelDisabled: BooleanInput;
  static ngAcceptInputType_nzCancelLoading: BooleanInput;
  static ngAcceptInputType_nzKeyboard: BooleanInput;
  static ngAcceptInputType_nzNoAnimation: BooleanInput;
  static ngAcceptInputType_nzOkDanger: BooleanInput;
  static ngAcceptInputType_nzCentered: BooleanInput;

  @Input() @InputBoolean() nzMask?: boolean;
  @Input() @InputBoolean() nzMaskClosable?: boolean;
  @Input() @InputBoolean() nzCloseOnNavigation?: boolean;
  @Input() @InputBoolean() nzVisible: boolean = false;
  @Input() @InputBoolean() nzClosable: boolean = true;
  @Input() @InputBoolean() nzOkLoading: boolean = false;
  @Input() @InputBoolean() nzOkDisabled: boolean = false;
  @Input() @InputBoolean() nzCancelDisabled: boolean = false;
  @Input() @InputBoolean() nzCancelLoading: boolean = false;
  @Input() @InputBoolean() nzKeyboard: boolean = true;
  @Input() @InputBoolean() nzNoAnimation = false;
  @Input() @InputBoolean() nzCentered = false;
  @Input() nzContent?: string | TemplateRef<{}> | Type<T>;
  @Input() nzComponentParams?: T;
  @Input() nzFooter?: string | TemplateRef<{}> | Array<ModalButtonOptions<T>> | null;
  @Input() nzZIndex: number = 1000;
  @Input() nzWidth: number | string = 520;
  @Input() nzWrapClassName?: string;
  @Input() nzClassName?: string;
  @Input() nzStyle?: object;
  @Input() nzTitle?: string | TemplateRef<{}>;
  @Input() nzCloseIcon: string | TemplateRef<void> = 'close';
  @Input() nzMaskStyle?: StyleObjectLike;
  @Input() nzBodyStyle?: StyleObjectLike;
  @Input() nzOkText?: string | null;
  @Input() nzCancelText?: string | null;
  @Input() nzOkType: NzButtonType = 'primary';
  @Input() @InputBoolean() nzOkDanger: boolean = false;
  @Input() nzIconType: string = 'question-circle'; // Confirm Modal ONLY
  @Input() nzModalType: ModalTypes = 'default';
  @Input() nzAutofocus: 'ok' | 'cancel' | 'auto' | null = 'auto';

  // TODO(@hsuanxyz) Input will not be supported
  @Input()
  @Output()
  readonly nzOnOk: EventEmitter<T> | OnClickCallback<T> | NzSafeAny = new EventEmitter<T>();

  // TODO(@hsuanxyz) Input will not be supported
  @Input()
  @Output()
  readonly nzOnCancel: EventEmitter<T> | OnClickCallback<T> | NzSafeAny =
    new EventEmitter<T>();

  @Output() readonly nzAfterOpen = new EventEmitter<void>();
  @Output() readonly nzAfterClose = new EventEmitter<R>();
  @Output() readonly nzVisibleChange = new EventEmitter<boolean>();

  // ? title 이 디렉티브로 <nz-modal> 안에 선언되었을 경우
  @ContentChild(NzModalTitleDirective, { static: true, read: TemplateRef })
  set modalTitle(value: TemplateRef<NzSafeAny>) {
    if (value) {
      this.setTitleWithTemplate(value);
    }
  }

  // ? content 가 디렉티브로 <nz-modal> 안에 선언되었을 경우
  @ContentChild(NzModalContentDirective, { static: true, read: TemplateRef })
  contentFromContentChild!: TemplateRef<NzSafeAny>;

  // ? footer 가 디렉티브로 <nz-modal> 안에 선언되었을 경우
  @ContentChild(NzModalFooterDirective, { static: true, read: TemplateRef })
  set modalFooter(value: TemplateRef<NzSafeAny>) {
    if (value) {
      this.setFooterWithTemplate(value);
    }
  }

  private modalRef: NzModalRef | null = null;
  private destroy$ = new Subject<void>();

  get afterOpen(): Observable<void> {
    // Observable alias for nzAfterOpen
    return this.nzAfterOpen.asObservable();
  }

  get afterClose(): Observable<R> {
    // Observable alias for nzAfterClose
    return this.nzAfterClose.asObservable();
  }

  constructor(
    private cdr: ChangeDetectorRef,
    // NzModalService 는 NzModalModule 에 provide 되어있다.
    private modal: NzModalService,
    // <nz-modal> 방식으로 modal 을 호출할때에는
    // 아래의 viewContainerRef 가 config.nzViewContainerRef 에 세팅된다.
    private viewContainerRef: ViewContainerRef,
  ) {}

  open(): void {
    if (!this.nzVisible) {
      this.nzVisible = true;
      this.nzVisibleChange.emit(true);
    }

    if (!this.modalRef) {
      const config = this.getConfig();
      this.modalRef = this.modal.create(config);

      // When the modal is implicitly closed (e.g. closeAll)
      // the nzVisible needs to be set to the correct value and emit.
      // ? 서비스를 통한 closeAll() 등 액션이 발생할 경우,
      // ? 아래 구독이 작동하여 nzVisible 값을 모달 상태랑 동기화 시킨다.
      this.modalRef.afterClose
        .asObservable()
        .pipe(takeUntil(this.destroy$))
        .subscribe(() => {
          this.close();
        });
    }
  }

  close(result?: R): void {
    if (this.nzVisible) {
      this.nzVisible = false;
      this.nzVisibleChange.emit(false);
    }

    if (this.modalRef) {
      this.modalRef.close(result);
      this.modalRef = null;
    }
  }

  destroy(result?: R): void {
    this.close(result);
  }

  triggerOk(): void {
    this.modalRef?.triggerOk();
  }

  triggerCancel(): void {
    this.modalRef?.triggerCancel();
  }

  getContentComponent(): T | void {
    return this.modalRef?.getContentComponent();
  }

  getElement(): HTMLElement | void {
    return this.modalRef?.getElement();
  }

  getModalRef(): NzModalRef | null {
    return this.modalRef;
  }

  private setTitleWithTemplate(templateRef: TemplateRef<{}>): void {
    this.nzTitle = templateRef;
    if (this.modalRef) {
      // If modalRef already created, set the title in next tick
      // ? Promise 를 사용하여 실행부분은 microtask 에 넣어서, 다음 tick 에서 title 이 세팅되게 한다.
      // ! modalRef 에서 모든 준비가 끝나기를 기다리는 느낌? 이다.
      Promise.resolve().then(() => {
        this.modalRef!.updateConfig({
          nzTitle: this.nzTitle,
        });
      });
    }
  }

  private setFooterWithTemplate(templateRef: TemplateRef<{}>): void {
    this.nzFooter = templateRef;
    if (this.modalRef) {
      // If modalRef already created, set the footer in next tick
      Promise.resolve().then(() => {
        this.modalRef!.updateConfig({
          nzFooter: this.nzFooter,
        });
      });
    }

    this.cdr.markForCheck();
  }

  /**
   * * open() 함수에서 NzModalRef 를 생성할때 사용된다.
   * ? 현재 생성된 컴포넌트 인스턴스의 모든 Input() 을 뽑아낸다.
   * ? Input() 항목들에서 nzViewcontainerRef, nzContent 를 재설정해준다.
   * @returns
   */
  private getConfig(): ModalOptions {
    const componentConfig = getConfigFromComponent(this);
    // ? <nz-modal> 방식으로 modal 을 호출할때에는
    // ? this.viewContainerRef 가 config.nzViewContainerRef 에 세팅된다.
    componentConfig.nzViewContainerRef = this.viewContainerRef;
    componentConfig.nzContent = this.nzContent || this.contentFromContentChild;
    return componentConfig;
  }

  ngOnChanges(changes: SimpleChanges): void {
    const { nzVisible, ...otherChanges } = changes;

    //? nzVisibel 제외한 기타 Input() 항목들이 변경됐을 경우
    if (Object.keys(otherChanges).length && this.modalRef) {
      this.modalRef.updateConfig(getConfigFromComponent(this));
    }

    // ? nzVisible 항목이 변경됐을 경우
    if (nzVisible) {
      if (this.nzVisible) {
        this.open();
      } else {
        this.close();
      }
    }
  }

  /**
   * * NzModalComponent 가 destroy 될때 실행된다.
   * ? <nz-modal> 태그로 modal 을 생성할 경우 해당 컴포넌트는 modal 이 닫혀도 destroy 되지 않는다.
   * ? 페이지 이동 같은 호출부 컴포넌트가 destroy 되어야지 해당 컴포넌트도 destroy 된다.
   */
  ngOnDestroy(): void {
    // ? 모달이 닫히는 최종단계는 항상 ref._finishDialogClose() 함수이다.
    this.modalRef?._finishDialogClose();
    this.destroy$.next();
    this.destroy$.complete();
  }
}
