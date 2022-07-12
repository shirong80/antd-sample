/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import { ChangeDetectionStrategy, Component } from '@angular/core';

import { ModalOptions } from '../modal-types';

@Component({
  selector: 'div[nz-modal-title]',
  exportAs: 'NzModalTitleBuiltin',
  templateUrl: './modal-title.component.html',
  host: {
    class: 'wise-modal-header',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NzModalTitleComponent {
  constructor(public config: ModalOptions) {}
}
