/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import { ESCAPE, hasModifierKey } from '@angular/cdk/keycodes';
import { OverlayRef } from '@angular/cdk/overlay';
import { EventEmitter } from '@angular/core';
import { Subject } from 'rxjs';
import { filter, take, takeUntil } from 'rxjs/operators';

import { NzSafeAny } from 'ng-zorro-antd/core/types';
import { isPromise } from 'ng-zorro-antd/core/util';

import { BaseModalContainerComponent } from './modal-container/modal-container.directive';
import { NzModalLegacyAPI } from './modal-legacy-api';
import { ModalOptions } from './modal-types';

export const enum NzModalState {
  OPEN,
  CLOSING,
  CLOSED,
}

export const enum NzTriggerAction {
  CANCEL = 'cancel',
  OK = 'ok',
}

export class NzModalRef<T = NzSafeAny, R = NzSafeAny> implements NzModalLegacyAPI<T, R> {
  componentInstance: T | null = null;
  result?: R;
  state: NzModalState = NzModalState.OPEN;
  afterClose: Subject<R> = new Subject();
  afterOpen: Subject<void> = new Subject();

  private closeTimeout?: ReturnType<typeof setTimeout>;

  private destroy$ = new Subject<void>();

  constructor(
    private overlayRef: OverlayRef,
    private config: ModalOptions,
    public containerInstance: BaseModalContainerComponent,
  ) {
    // ? 모달이 열린 직후 시점에 트리거 된다.
    containerInstance.animationStateChanged
      .pipe(
        // onAnimationDone() 에서 toState === 'enter' 일때 호출된다.
        filter((event) => event.phaseName === 'done' && event.toState === 'enter'),
        take(1),
      )
      .subscribe(() => {
        this.afterOpen.next();
        this.afterOpen.complete();
        if (config.nzAfterOpen instanceof EventEmitter) {
          config.nzAfterOpen.emit();
        }
      });

    // ? 모달이 닫힌 직후 시점에 트리거 된다.
    containerInstance.animationStateChanged
      .pipe(
        // onAnimationDone() 에서 toState === 'exit' 일때 호출된다.
        filter((event) => event.phaseName === 'done' && event.toState === 'exit'),
        take(1),
      )
      .subscribe(() => {
        clearTimeout(this.closeTimeout);
        this._finishDialogClose();
      });

    // TODO: 로딩을 캔슬가능하게 하는 관찰자?? 이부분은 좀더 확인이 필요하다.
    containerInstance.containerClick.pipe(take(1), takeUntil(this.destroy$)).subscribe(() => {
      const cancelable = !this.config.nzCancelLoading && !this.config.nzOkLoading;
      if (cancelable) {
        this.trigger(NzTriggerAction.CANCEL);
      }
    });

    overlayRef
      .keydownEvents()
      .pipe(
        filter(
          (event) =>
            (this.config.nzKeyboard as boolean) &&
            !this.config.nzCancelLoading &&
            !this.config.nzOkLoading &&
            event.keyCode === ESCAPE &&
            !hasModifierKey(event),
        ),
      )
      .subscribe((event) => {
        event.preventDefault();
        this.trigger(NzTriggerAction.CANCEL);
      });

    containerInstance.cancelTriggered
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.trigger(NzTriggerAction.CANCEL));

    containerInstance.okTriggered
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.trigger(NzTriggerAction.OK));

    overlayRef.detachments().subscribe(() => {
      // 아래 소스 타입스크립트 오류땜에 수정(this.result 가 undefined 일 경우 타입오류 발생한다.)
      this.afterClose.next(this.result!);
      this.afterClose.complete();
      if (config.nzAfterClose instanceof EventEmitter) {
        config.nzAfterClose.emit(this.result);
      }
      this.componentInstance = null;
      this.overlayRef.dispose();
    });
  }

  getContentComponent(): T {
    return this.componentInstance as T;
  }

  getElement(): HTMLElement {
    return this.containerInstance.getNativeElement();
  }

  destroy(result?: R): void {
    this.close(result);
  }

  triggerOk(): Promise<void> {
    return this.trigger(NzTriggerAction.OK);
  }

  triggerCancel(): Promise<void> {
    return this.trigger(NzTriggerAction.CANCEL);
  }

  close(result?: R): void {
    if (this.state !== NzModalState.OPEN) {
      return;
    }
    this.result = result;
    this.containerInstance.animationStateChanged
      .pipe(
        filter((event) => event.phaseName === 'start'),
        take(1),
      )
      .subscribe((event) => {
        this.overlayRef.detachBackdrop();
        this.closeTimeout = setTimeout(() => {
          this._finishDialogClose();
        }, event.totalTime + 100);
      });

    this.containerInstance.startExitAnimation();
    this.state = NzModalState.CLOSING;
  }

  updateConfig(config: ModalOptions): void {
    Object.assign(this.config, config);
    this.containerInstance.bindBackdropStyle();
    this.containerInstance.cdr.markForCheck();
  }

  getState(): NzModalState {
    return this.state;
  }

  getConfig(): ModalOptions {
    return this.config;
  }

  getBackdropElement(): HTMLElement | null {
    return this.overlayRef.backdropElement;
  }

  private async trigger(action: NzTriggerAction): Promise<void> {
    if (this.state === NzModalState.CLOSING) {
      return;
    }
    const trigger = { ok: this.config.nzOnOk, cancel: this.config.nzOnCancel }[action];
    const loadingKey = { ok: 'nzOkLoading', cancel: 'nzCancelLoading' }[action] as
      | 'nzOkLoading'
      | 'nzCancelLoading';
    const loading = this.config[loadingKey];
    if (loading) {
      return;
    }
    if (trigger instanceof EventEmitter) {
      trigger.emit(this.getContentComponent());
    } else if (typeof trigger === 'function') {
      const result = trigger(this.getContentComponent());
      if (isPromise(result)) {
        this.config[loadingKey] = true;
        let doClose: boolean | void | {} = false;
        try {
          doClose = await result;
        } finally {
          this.config[loadingKey] = false;
          this.closeWhitResult(doClose);
        }
      } else {
        this.closeWhitResult(result);
      }
    }
  }

  private closeWhitResult(result: NzSafeAny): void {
    if (result !== false) {
      this.close(result);
    }
  }

  _finishDialogClose(): void {
    this.state = NzModalState.CLOSED;
    this.overlayRef.dispose();
    this.destroy$.next();
  }
}
