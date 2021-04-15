import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';

import { ExampleComponent } from './example/example.component';
import { MatDialogModule } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { ImportExportService } from '../importExport.service';

@NgModule({
  declarations: [
    ExampleComponent
  ],
  imports: [
    BrowserModule,
    MatButtonModule,
    MatCardModule,
    MatDialogModule,
    MatInputModule,
    FormsModule
  ],
  exports: [
    ExampleComponent,
    MatDialogModule
  ],
  providers: [
    ImportExportService
  ]
})
export class ComponentsModule { }
