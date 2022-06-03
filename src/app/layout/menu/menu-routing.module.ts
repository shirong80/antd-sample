import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { LayoutMenuComponent } from './menu.component';

export const routes: Routes = [
  {
    path: '',
    component: LayoutMenuComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LayoutMenuRoutingModule {}
