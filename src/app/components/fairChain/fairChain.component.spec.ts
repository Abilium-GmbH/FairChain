import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FairChainComponent } from './fairChain.component';
import { UndoRedoService } from './../../undoRedo.service';
import { ImportExportService } from './../../importExport.service';
import { Tools, ChangingNode, ChangingEdge } from '../../Enums';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { FlagService } from './../../flag.service';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('FairChainComponent', () => {
  let component: FairChainComponent;
  let fixture: ComponentFixture<FairChainComponent>;
  let importExportServiceStub: Partial<ImportExportService>;
  let undoRedoServiceStub: Partial<UndoRedoService>;
  let flagServiceStub: Partial<FlagService>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FairChainComponent],
      providers: [
        { provide: ImportExportService, useValue: importExportServiceStub },
        { provide: UndoRedoService, useValue: undoRedoServiceStub },
        { provide: FlagService, useValue: flagServiceStub }],
      imports: [ MatSnackBarModule, NoopAnimationsModule,  ],
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

  it('should change currentTool to AddingEdge', () => {
    component.addEdgeInNetwork();
    var currentTool = component.getCurrentTool();
    expect(currentTool).toBe(Tools.AddingEdge)
  })

  it('should change currentTool to Idle after calling addEdgeInNetwork 2 times', () => {
    component.addEdgeInNetwork();
    component.addEdgeInNetwork();
    var currentTool = component.getCurrentTool();
    expect(currentTool).toBe(Tools.Idle)
  })

  it('should change currentTool to AddingNode', () => {
    component.addNodeInNetwork();
    var currentTool = component.getCurrentTool();
    expect(currentTool).toBe(Tools.AddingNode)
  })

  it('should change currentTool to Idle after calling addNodeInNetwork 2 times', () => {
    component.addNodeInNetwork();
    component.addNodeInNetwork();
    var currentTool = component.getCurrentTool();
    expect(currentTool).toBe(Tools.Idle)
  })

  it('should change currentTool to AddingNode if you first call addEdgeInNetwork and then addEdgeInNetwork', () => {
    component.addNodeInNetwork();
    component.addEdgeInNetwork();
    var currentTool = component.getCurrentTool();
    expect(currentTool).toBe(Tools.AddingEdge)
  })

  it('should change currentTool to AddingNode if you first call addEdgeInNetwork and then addEdgeInNetwork', () => {
    component.addEdgeInNetwork();
    component.addNodeInNetwork();
    var currentTool = component.getCurrentTool();
    expect(currentTool).toBe(Tools.AddingNode)
  })


});
