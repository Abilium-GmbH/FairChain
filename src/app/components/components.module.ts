import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';

import { ExampleComponent } from './example/example.component';
import { MatDialogModule } from '@angular/material/dialog';

@NgModule({
  declarations: [
    ExampleComponent
  ],
  imports: [
    BrowserModule,
    MatButtonModule,
    MatCardModule,
    MatDialogModule
],
  exports: [
    ExampleComponent,
    MatDialogModule
  ]
})
export class ComponentsModule { }
