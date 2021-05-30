import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FairChainComponent } from './fairChain.component';
import { UndoRedoService } from './../../undoRedo.service';
import { ImportExportService } from './../../importExport.service';
import { Tools,ChangingNode,ChangingEdge} from '../../Enums';
import { MatSnackBarModule } from '@angular/material/snack-bar';

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
        {provide: UndoRedoService, useValue: undoRedoServiceStub}],
      imports: [ MatSnackBarModule ],
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

  
  it('should change changesNode to NodeColor', ()=>{
    component.changeNodeName();
    var changesNode = component.getChangesNode();
    expect(changesNode).toBe(ChangingNode.NodeLabel)
  })

  it('should switch changesNode again to None after calling changeNodeName 2 times', ()=>{
    component.changeNodeName();
    component.changeNodeName();
    var changesNode = component.getChangesNode();
    expect(changesNode).toBe(ChangingNode.None)
  })

  it('should change changesEdge to EdgeColor', ()=>{
    component.changeEdgeName();
    var changesEdge = component.getChangesEdge();
    expect(changesEdge).toBe(ChangingEdge.EdgeLabel)
  })

  it('should switch changesEdge again to None after calling changeEdgeName 2 times', ()=>{
    component.changeEdgeName();
    component.changeEdgeName();
    var changesEdge = component.getChangesEdge();
    expect(changesEdge).toBe(ChangingEdge.None)
  })

  it('should change currentTool to AddingEdge', ()=>{
    component.addEdgeInNetwork();
    var currentTool = component.getCurrentTool();
    expect(currentTool).toBe(Tools.AddingEdge)
  })

  it('should change currentTool to Idle after calling addEdgeInNetwork 2 times', ()=>{
    component.addEdgeInNetwork();
    component.addEdgeInNetwork();
    var currentTool = component.getCurrentTool();
    expect(currentTool).toBe(Tools.Idle)
  })

  it('should change currentTool to AddingNode', ()=>{
    component.addNodeInNetwork();
    var currentTool = component.getCurrentTool();
    expect(currentTool).toBe(Tools.AddingNode)
  })

  it('should change currentTool to Idle after calling addNodeInNetwork 2 times', ()=>{
    component.addNodeInNetwork();
    component.addNodeInNetwork();
    var currentTool = component.getCurrentTool();
    expect(currentTool).toBe(Tools.Idle)
  })

  it('should change currentTool to AddingNode if you first call addEdgeInNetwork and then addEdgeInNetwork', ()=>{
    component.addNodeInNetwork();
    component.addEdgeInNetwork();
    var currentTool = component.getCurrentTool();
    expect(currentTool).toBe(Tools.AddingEdge)
  })

  it('should change currentTool to AddingNode if you first call addEdgeInNetwork and then addEdgeInNetwork', ()=>{
    component.addEdgeInNetwork();
    component.addNodeInNetwork();
    var currentTool = component.getCurrentTool();
    expect(currentTool).toBe(Tools.AddingNode)
  })

 

  it('should change currentTool to AddingEdge and changesNode to None if you first call changeNodeName and then addNodeInNetwork', ()=>{
    component.changeNodeName();
    component.addNodeInNetwork();
    var currentTool = component.getCurrentTool();
    var changesNode = component.getChangesNode()
    expect(currentTool).toBe(Tools.AddingNode, 'currentTool is wrong')
    expect(changesNode).toBe(ChangingNode.None, 'changesNode is wrong')
  })
  
});
