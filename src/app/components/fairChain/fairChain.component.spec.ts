import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FairChainComponent } from './fairChain.component';
import { UndoRedoService } from './../../undoRedo.service';
import { ImportExportService } from './../../importExport.service';

describe('FairChainComponent', () => {
  let component: FairChainComponent;
  let fixture: ComponentFixture<FairChainComponent>;
  let importExportServiceStub: Partial<ImportExportService>;
  let undoRedoServiceStub: Partial<UndoRedoService>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FairChainComponent ],
      providers: [
        {provide: ImportExportService, useValue: importExportServiceStub},
        {provide: UndoRedoService, useValue: undoRedoServiceStub}]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FairChainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
