import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: '', redirectTo: '/sample', pathMatch: 'full' },
  {
    path: 'sample',
    loadChildren: () =>
      import('src/app/sample/sample.module').then((m) => m.SampleModule),
    data: { title: '샘플페이지' },
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
