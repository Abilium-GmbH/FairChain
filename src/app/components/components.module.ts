import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { MatButtonModule } from '@angular/material/button';

import { ExampleComponent } from './example/example.component';

@NgModule({
  declarations: [
    ExampleComponent
  ],
  imports: [
    BrowserModule,
    MatButtonModule
  ],
  exports: [
    ExampleComponent
  ]
})
export class ComponentsModule { }
