import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { ComponentsModule } from './components/components.module';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { EditorPage } from './pages/editor/editor.page';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { NodeHoverOptionComponent } from './components/node-hover-option/node-hover-option.component';
//import { RelabelPopUpComponent } from './components/relabel-pop-up/relabel-pop-up.component';

@NgModule({
  declarations: [
    AppComponent,
    EditorPage
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    ComponentsModule,
    MatCardModule,
    MatButtonModule,
    MatInputModule,
    FormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
