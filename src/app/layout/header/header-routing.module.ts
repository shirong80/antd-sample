import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { LayoutHeaderComponent } from './header.component';

export const routes: Routes = [
  {
    path: '',
    component: LayoutHeaderComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LayoutHeaderRoutingModule {}
