import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FairChainComponent } from './fairChain.component';

describe('FairChainComponent', () => {
  let component: FairChainComponent;
  let fixture: ComponentFixture<FairChainComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FairChainComponent ]
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
    component.changeNodeColor();
    var changesNode = component.getChangesNode();
    expect(changesNode).toBe(ChangingNode.NodeColor)
  })

  it('should switch changesNode again to None after calling changeNodeColor 2 times', ()=>{
    component.changeNodeColor();
    component.changeNodeColor();
    var changesNode = component.getChangesNode();
    expect(changesNode).toBe(ChangingNode.None)
  })
  
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
    component.changeEdgeColor();
    var changesEdge = component.getChangesEdge();
    expect(changesEdge).toBe(ChangingEdge.EdgeColor)
  })
  
  it('should change changesEdge to EdgeColor', ()=>{
    component.changeEdgeColor();
    var changesEdge = component.getChangesEdge();
    expect(changesEdge).toBe(ChangingEdge.EdgeColor)
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

  it('should change currentTool to Idle and changesNode to NodeColor if you first call addEdgeInNetwork and then changeNodeColor', ()=>{
    component.addEdgeInNetwork();
    component.changeNodeColor();
    var currentTool = component.getCurrentTool();
    var changesNode = component.getChangesNode()
    expect(currentTool).toBe(Tools.Idle, 'currentTool is wrong')
    expect(changesNode).toBe(ChangingNode.NodeColor, 'changesNode is wrong')
  })

  it('should change currentTool to AddingEdge and changesNode to None if you first call changeNodeColor and then addEdgeInNetwork', ()=>{
    component.changeNodeColor();
    component.addEdgeInNetwork();
    var currentTool = component.getCurrentTool();
    var changesNode = component.getChangesNode()
    expect(currentTool).toBe(Tools.AddingEdge, 'currentTool is wrong')
    expect(changesNode).toBe(ChangingNode.None, 'changesNode is wrong')
  })

  it('should change currentTool to Idle and changesNode to NodeColor if you first call addNodeInNetwork and then changeNodeColor', ()=>{
    component.addNodeInNetwork();
    component.changeNodeColor();
    var currentTool = component.getCurrentTool();
    var changesNode = component.getChangesNode()
    expect(currentTool).toBe(Tools.Idle, 'currentTool is wrong')
    expect(changesNode).toBe(ChangingNode.NodeColor, 'changesNode is wrong')
  })

  it('should change currentTool to AddingEdge and changesNode to None if you first call changeNodeColor and then addNodeInNetwork', ()=>{
    component.changeNodeColor();
    component.addNodeInNetwork();
    var currentTool = component.getCurrentTool();
    var changesNode = component.getChangesNode()
    expect(currentTool).toBe(Tools.AddingNode, 'currentTool is wrong')
    expect(changesNode).toBe(ChangingNode.None, 'changesNode is wrong')
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
