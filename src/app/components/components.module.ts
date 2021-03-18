import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';

import { ExampleComponent } from './example/example.component';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    ExampleComponent
  ],
  imports: [
    BrowserModule,
    MatButtonModule,
    MatCardModule,
    MatInputModule,
    FormsModule
  ],
  exports: [
    ExampleComponent
  ]
})
export class ComponentsModule { }
