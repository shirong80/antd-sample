/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import { Observable } from 'rxjs';

// 해당 클래스를 사용하는 시점에 반드시 T, R 의 타입을 확정해줘야 한다.
// 그러면 클래스 내부의 함수를 사용할때도 T, R 에 맞는 타입의 파라미터를 넘겨줘야 하고, 결과 또한 해당타입에 맞게 받아가야 한다.
export abstract class NzModalLegacyAPI<T, R> {
  abstract afterOpen: Observable<void>;
  abstract afterClose: Observable<R>;

  abstract close(result?: R): void;
  abstract destroy(result?: R): void;

  /**
   * Trigger the nzOnOk/nzOnCancel by manual
   */
  abstract triggerOk(): void;
  abstract triggerCancel(): void;
  /**
   * Return the component instance of nzContent when specify nzContent as a Component
   */
  abstract getContentComponent(): T | void;

  /**
   * Get the dom element of this Modal
   */
  abstract getElement(): HTMLElement | void;
}
