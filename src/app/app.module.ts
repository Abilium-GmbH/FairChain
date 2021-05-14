import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { ComponentsModule } from './components/components.module';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { EditorPage } from './pages/editor/editor.page';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatSelectModule} from '@angular/material/select';
//import { RelabelPopUpComponent } from './components/relabel-pop-up/relabel-pop-up.component';


@NgModule({
  declarations: [
    AppComponent,
    EditorPage
  ],
  imports: [
    BrowserModule,BrowserAnimationsModule, FormsModule, ReactiveFormsModule, MatSelectModule,



    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    ComponentsModule,
    MatCardModule,
    MatButtonModule,
    MatInputModule,
    NgbModule,
    FormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
