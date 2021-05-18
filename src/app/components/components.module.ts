import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { FairChainComponent } from './fairChain/fairChain.component';
import { RelabelPopUpComponent } from './relabel-pop-up/relabel-pop-up.component';
import { MatDialogModule } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { ImportExportService } from '../importExport.service';
import { UndoRedoService } from '../undoRedo.service';
import { MatRadioModule } from '@angular/material/radio'; 
import { MatSidenavModule } from '@angular/material/sidenav';

@NgModule({
  declarations: [
    FairChainComponent,
    RelabelPopUpComponent
  ],
  imports: [
    BrowserModule,
    MatButtonModule,
    MatCardModule,
    MatDialogModule,
    MatInputModule,
    FormsModule,
    MatRadioModule,
    MatSidenavModule
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
