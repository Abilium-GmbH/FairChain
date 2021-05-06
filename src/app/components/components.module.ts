import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';

import { FairChainComponent } from './fairChain/fairChain.component';
import { MatDialogModule } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { ImportExportService } from '../importExport.service';
import { UndoRedoService } from '../undoRedo.service';

@NgModule({
  declarations: [
    FairChainComponent
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
    FairChainComponent,
    MatDialogModule
  ],
  providers: [
    ImportExportService,
    UndoRedoService
  ]
})
export class ComponentsModule { }
