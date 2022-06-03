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
  {
    path: 'convert',
    loadChildren: () =>
      import('src/app/routes/convert/convert.module').then(
        (m) => m.ConvertModule
      ),
    data: { title: '변환페이지' },
  },
  {
    path: 'history',
    loadChildren: () =>
      import('src/app/routes/history/history.module').then(
        (m) => m.HistoryModule
      ),
    data: { title: '변환내역' },
  },
  {
    path: 'main',
    loadChildren: () =>
      import('src/app/routes/main/main.module').then((m) => m.MainModule),
    data: { title: '메인페이지' },
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
