import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';

import { ExampleComponent } from './example/example.component';

@NgModule({
  declarations: [
    ExampleComponent
  ],
  imports: [
    BrowserModule,
    MatButtonModule,
    MatCardModule
  ],
  exports: [
    ExampleComponent
  ]
})
export class ComponentsModule { }
