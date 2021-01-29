import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EditorPage } from './pages/editor/editor.page';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'editor',
    pathMatch: 'full'
  },
  {
    path: 'editor',
    children: [{
      path: '',
      component: EditorPage,
    }]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
