import { TemplateRef } from '@angular/core';

import { NzSafeAny } from 'ng-zorro-antd/core/types';

export type NzSelectModeType = 'default' | 'multiple' | 'tags';
export interface NzSelectItemInterface {
  template?: TemplateRef<NzSafeAny> | null;
  nzLabel: string | number | null;
  nzValue: NzSafeAny | null;
  nzDisabled?: boolean;
  nzHide?: boolean;
  nzCustomContent?: boolean;
  groupLabel?: string | number | TemplateRef<NzSafeAny> | null;
  type?: string;
  key?: NzSafeAny;
}

export interface NzSelectOptionInterface {
  label: string | number | null | TemplateRef<NzSafeAny>;
  value: NzSafeAny | null;
  disabled?: boolean;
  hide?: boolean;
  groupLabel?: string | number | TemplateRef<NzSafeAny> | null;
}

export type NzSelectTopControlItemType = Partial<NzSelectItemInterface> & {
  contentTemplateOutlet: TemplateRef<NzSafeAny> | null;
  contentTemplateOutletContext: NzSafeAny;
};

export type NzFilterOptionType = (
  input: string,
  option: NzSelectItemInterface
) => boolean;
