import { Directionality } from '@angular/cdk/bidi';
import { ComponentType, Overlay, OverlayConfig, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal, TemplatePortal } from '@angular/cdk/portal';
import {
  Injectable,
  Injector,
  OnDestroy,
  Optional,
  SkipSelf,
  TemplateRef,
} from '@angular/core';
import { defer, Observable, Subject } from 'rxjs';
import { startWith } from 'rxjs/operators';

import { NzConfigService } from 'ng-zorro-antd/core/config';
import { warn } from 'ng-zorro-antd/core/logger';
import { IndexableObject, NzSafeAny } from 'ng-zorro-antd/core/types';
import { isNotNil } from 'ng-zorro-antd/core/util';

import { MODAL_MASK_CLASS_NAME, NZ_CONFIG_MODULE_NAME } from './modal-config';
import { NzModalConfirmContainerComponent } from './modal-confirm-container/modal-confirm-container.component';
import { NzModalContainerComponent } from './modal-container/modal-container.component';
import { BaseModalContainerComponent } from './modal-container/modal-container.directive';
import { NzModalRef } from './modal-ref';
import { ConfirmType, ModalOptions } from './modal-types';
import { applyConfigDefaults, getValueWithConfig, setContentInstanceParams } from './utils';

type ContentType<T> = ComponentType<T> | TemplateRef<T> | string;

@Injectable()
export class NzModalService implements OnDestroy {
  // ? 현재 레벨에서 열려있는 모든 모달들의 리스트
  // ! 다른 레벨에서 모달이 열릴 경우에는 새로운 서비스 인스턴스가 생성되나?? 확인필요!!!
  // * 새로운 서비스 인스턴스가 생성되는거 같다. 생성자 함수에서 parentModal 이라는 NzModalService 를 주입받는다.
  private openModalsAtThisLevel: NzModalRef[] = [];
  private readonly afterAllClosedAtThisLevel = new Subject<void>();

  get openModals(): NzModalRef[] {
    return this.parentModal ? this.parentModal.openModals : this.openModalsAtThisLevel;
  }

  get _afterAllClosed(): Subject<void> {
    const parent = this.parentModal;
    return parent ? parent._afterAllClosed : this.afterAllClosedAtThisLevel;
  }

  readonly afterAllClose: Observable<void> = defer(() =>
    this.openModals.length
      ? this._afterAllClosed
      : this._afterAllClosed.pipe(startWith(undefined)),
  ) as Observable<void>;

  constructor(
    private overlay: Overlay,
    private injector: Injector,
    private nzConfigService: NzConfigService,
    @Optional() @SkipSelf() private parentModal: NzModalService,
    @Optional() private directionality: Directionality,
  ) {}

  // ? T 는 nzContent 의 타입이다.
  // ? T 가 Component, TemplateRef, string 등 타입일수 있다.
  create<T, R = NzSafeAny>(config: ModalOptions<T, R>): NzModalRef<T, R> {
    return this.open<T, R>(config.nzContent as ComponentType<T>, config);
  }

  closeAll(): void {
    this.closeModals(this.openModals);
  }

  confirm<T>(
    options: ModalOptions<T> = {},
    confirmType: ConfirmType = 'confirm',
  ): NzModalRef<T> {
    if ('nzFooter' in options) {
      warn(`The Confirm-Modal doesn't support "nzFooter", this property will be ignored.`);
    }
    if (!('nzWidth' in options)) {
      options.nzWidth = 416;
    }
    if (!('nzMaskClosable' in options)) {
      options.nzMaskClosable = false;
    }

    options.nzModalType = 'confirm';
    options.nzClassName = `wise-modal-confirm wise-modal-confirm-${confirmType} ${
      options.nzClassName || ''
    }`;
    return this.create(options);
  }

  info<T>(options: ModalOptions<T> = {}): NzModalRef<T> {
    return this.confirmFactory(options, 'info');
  }

  success<T>(options: ModalOptions<T> = {}): NzModalRef<T> {
    return this.confirmFactory(options, 'success');
  }

  error<T>(options: ModalOptions<T> = {}): NzModalRef<T> {
    return this.confirmFactory(options, 'error');
  }

  warning<T>(options: ModalOptions<T> = {}): NzModalRef<T> {
    return this.confirmFactory(options, 'warning');
  }

  private open<T, R>(
    componentOrTemplateRef: ContentType<T>,
    config?: ModalOptions,
  ): NzModalRef<T, R> {
    const configMerged = applyConfigDefaults(config || {}, new ModalOptions());
    const overlayRef = this.createOverlay(configMerged);
    const modalContainer = this.attachModalContainer(overlayRef, configMerged);
    const modalRef = this.attachModalContent<T, R>(
      componentOrTemplateRef,
      modalContainer,
      overlayRef,
      configMerged,
    );
    modalContainer.modalRef = modalRef;

    this.openModals.push(modalRef);
    modalRef.afterClose.subscribe(() => this.removeOpenModal(modalRef));

    return modalRef;
  }

  private removeOpenModal(modalRef: NzModalRef): void {
    const index = this.openModals.indexOf(modalRef);
    if (index > -1) {
      this.openModals.splice(index, 1);

      if (!this.openModals.length) {
        this._afterAllClosed.next();
      }
    }
  }

  private closeModals(dialogs: NzModalRef[]): void {
    let i = dialogs.length;
    while (i--) {
      // ? 아래에서 NzModelRef.close() 호출시,
      // ? NzModalService.removeOpenModal() 함수도 호출되면서,
      // ? this.openModals 리스트에서 해당 modelRef 를 제거한다.
      dialogs[i].close();
      if (!this.openModals.length) {
        this._afterAllClosed.next();
      }
    }
  }

  /**
   * * cdk 에서 제공하는 Overlay.create() 사용하여, OverlayRef 를 생성한다.
   */
  private createOverlay(config: ModalOptions): OverlayRef {
    const globalConfig: NzSafeAny =
      this.nzConfigService.getConfigForComponent(NZ_CONFIG_MODULE_NAME) || {};
    // ? ckd 에서 제공하는 OverlayConfig 클래스의 인스턴스를 생성한다.
    const overlayConfig = new OverlayConfig({
      hasBackdrop: true,
      scrollStrategy: this.overlay.scrollStrategies.block(),
      positionStrategy: this.overlay.position().global(),
      // getValueWithConfig() 는 파라미터들을 순차적을 체크하면서, undefinded가 아닌 값을 반환한다.
      disposeOnNavigation: getValueWithConfig(
        config.nzCloseOnNavigation,
        globalConfig.nzCloseOnNavigation,
        true,
      ),
      direction: getValueWithConfig(
        config.nzDirection,
        globalConfig.nzDirection,
        this.directionality.value,
      ),
    });
    if (getValueWithConfig(config.nzMask, globalConfig.nzMask, true)) {
      overlayConfig.backdropClass = MODAL_MASK_CLASS_NAME;
    }

    return this.overlay.create(overlayConfig);
  }

  /**
   * * BaseModalContainerComponent 타입의 modal-container 를 생성한다.
   * * cdk 에서 제공하는 Portal 이랑 Overlay 를 함께 사용한다.
   * @param overlayRef
   * @param config
   * @returns
   */
  private attachModalContainer(
    overlayRef: OverlayRef,
    config: ModalOptions,
  ): BaseModalContainerComponent {
    const userInjector =
      config && config.nzViewContainerRef && config.nzViewContainerRef.injector;
    // overlayRef에서 getDirection(), backdropElement 를 사용하기 위해서 container 에 주입시킨다.
    const injector = Injector.create({
      parent: userInjector || this.injector,
      providers: [
        { provide: OverlayRef, useValue: overlayRef },
        { provide: ModalOptions, useValue: config },
      ],
    });

    const ContainerComponent =
      config.nzModalType === 'confirm'
        ? // If the mode is `confirm`, use `NzModalConfirmContainerComponent`
          NzModalConfirmContainerComponent
        : // If the mode is not `confirm`, use `NzModalContainerComponent`
          NzModalContainerComponent;

    // ? cdk 에서 제공하는 ComponentPortal 클래스의 인스턴스를 생성한다.
    // ? 첫번째 Param: 동적으로 생성할 컴포넌트 타입
    // ? 두번재 Param: 동적으로 생성된 컴포넌트가 배치될 위치 (여기서는 modal.component 의 viewContainerRef 이다.)
    // ? 세번째 Param: 동적으로 생성할 컴포넌트에 주입될 인젝터
    // ! 생성된 ComponentPortal 은 반드시 어딘가에 attach 해줘야 한다.
    // * modal.component 의 viewContainerRef 안에 ContainerComponent 를 동적으로 생성해서 집어넣는다.
    const containerPortal = new ComponentPortal<BaseModalContainerComponent>(
      ContainerComponent,
      config.nzViewContainerRef,
      injector,
    );
    // ? 생성된 Portal 을 Overlay 에 집어 넣는다.
    const containerRef = overlayRef.attach<BaseModalContainerComponent>(containerPortal);

    return containerRef.instance;
  }

  /**
   * * NzModalRef 타입의 modelRef 를 생성한다.
   * @param componentOrTemplateRef
   * @param modalContainer
   * @param overlayRef
   * @param config
   * @returns
   */
  private attachModalContent<T, R>(
    componentOrTemplateRef: ContentType<T>,
    modalContainer: BaseModalContainerComponent,
    overlayRef: OverlayRef,
    config: ModalOptions<T>,
  ): NzModalRef<T, R> {
    const modalRef = new NzModalRef<T, R>(overlayRef, config, modalContainer);

    // ? modalContainer 템플릿에서 div.ant-modal-content 엘리먼트 하위에 *cdkPortalOutlet 이 있다.
    // ? 해당 portalOutlet 에 componentOrTemplateRef 가 랜더링 된다.
    if (componentOrTemplateRef instanceof TemplateRef) {
      // * 템플릿 타입의 content
      modalContainer.attachTemplatePortal(
        new TemplatePortal<T>(componentOrTemplateRef, null!, {
          $implicit: config.nzComponentParams,
          modalRef,
        } as NzSafeAny),
      );
    } else if (
      isNotNil(componentOrTemplateRef) &&
      typeof componentOrTemplateRef !== 'string'
    ) {
      // * 컴포넌트 타입의 content
      // ? content 컴포넌트의 인젝터를 생성한다.
      // ! content 컴포넌트에 NzModalRef provider 를 주입하는 부분이 있다는것을 명심하자.
      const injector = this.createInjector<T, R>(modalRef, config);
      const contentRef = modalContainer.attachComponentPortal<T>(
        new ComponentPortal(componentOrTemplateRef, config.nzViewContainerRef, injector),
      );
      setContentInstanceParams<T>(contentRef.instance, config.nzComponentParams);
      modalRef.componentInstance = contentRef.instance;
    } else {
      // * string 타입의 content
      modalContainer.attachStringContent();
    }
    return modalRef;
  }

  private createInjector<T, R>(modalRef: NzModalRef<T, R>, config: ModalOptions<T>): Injector {
    const userInjector =
      config && config.nzViewContainerRef && config.nzViewContainerRef.injector;

    return Injector.create({
      parent: userInjector || this.injector,
      providers: [{ provide: NzModalRef, useValue: modalRef }],
    });
  }

  private confirmFactory<T>(
    options: ModalOptions<T> = {},
    confirmType: ConfirmType,
  ): NzModalRef<T> {
    const iconMap: IndexableObject = {
      info: 'info-circle',
      success: 'check-circle',
      error: 'close-circle',
      warning: 'exclamation-circle',
    };
    if (!('nzIconType' in options)) {
      options.nzIconType = iconMap[confirmType];
    }
    if (!('nzCancelText' in options)) {
      // Remove the Cancel button if the user not specify a Cancel button
      options.nzCancelText = null;
    }
    return this.confirm(options, confirmType);
  }

  ngOnDestroy(): void {
    this.closeModals(this.openModalsAtThisLevel);
    this.afterAllClosedAtThisLevel.complete();
  }
}
