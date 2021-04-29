import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { fromEvent, Subscription } from 'rxjs';
import { ImportExportService } from '../../importExport.service'
import * as vis from 'vis-network';
import { UndoRedoService } from 'src/app/undoRedo.service';
import { strict as assert } from 'assert';

enum activeTool {
  AddingNode, AddingEdge, Idle
}


enum ChangingNode {
  NodeLabel,  NodeColor, None
}

enum ChangingEdge {
  EdgeLabel, EdgeColor, None
}

@Component({
  selector: 'app-fairChain',
  templateUrl: './fairChain.component.html',
  styleUrls: ['./fairChain.component.scss'],
  providers: [ ImportExportService, UndoRedoService ]
})

/**
 * This Component has many responsibilities. So far, it holds the basic Implementations of theProject,
 * such like addNode, addEdge, deleteSelection, edit NodeLabel and edge Label
 */
export class FairChainComponent implements OnInit {
  public isAddingNode() : boolean {return this.currentTool === activeTool.AddingNode;}
  public isAddingEdge() : boolean {return this.currentTool === activeTool.AddingEdge;}

  public isChangeNodeColor = false;
  public isChangeEdgeColor = false;
  public isDeletingNodesOrEdges = false;
  public isChangeNodeLabel = false;
  public isChangeEdgeLabel = false;
  public isShowNodeOptions = false;

  public testClassCSS = false;
 
  // A handy debug buttom for any 
  public isDebugging = true;
  public __debug__() {assert(this.isDebugging, 'Function should not be called unless in debug mode'), console.log(this.isAddingNode());}

  public nodeEdgeLabel = "";
  public nodeEdgeColor = "#002AFF";

  @ViewChild('graph', {static: true}) graphRef: ElementRef;

  private network: vis.Network;
  private subscriptions: Subscription = new Subscription();
  private fileToUpload: File = null;
  private changesNode: ChangingNode = ChangingNode.None;
  private changesEdge: ChangingEdge = ChangingEdge.None;
  public currentTool: activeTool = activeTool.Idle;


  // Create an array with nodes
  private nodes: vis.Node[] = [];

  // Create an array with edges
  private edges: vis.Edge[] = [];

  // Create a network
  private data: vis.Data = {
    nodes: this.nodes,
    edges: this.edges,
  };

  /**
   * Initializes Node and Edge Properties
   *
   * @private
   */
  private options: vis.Options = {
    nodes: {
      shape: 'box',
      physics: true
    },
    edges: {
      color: {
        inherit: false
      },
      smooth: true,
      physics: false,
      arrows: {
        to: {
         enabled: true,
        }
      }
    },
    manipulation: {
      // Defines logic for Add Node functionality
      addNode: (data: vis.Node, callback) => {
        assert(this.currentTool === activeTool.AddingNode, 'The current tool should be adding a node');
        callback(data);
        this.network.addNodeMode();
        this.nodes.push(data);
        this.undoRedoService.addSnapshot(this.nodes, this.edges);
      },
      // Defines logic for Add Edge functionality
      addEdge: (data: vis.Edge, callback) => {
        assert(this.currentTool === activeTool.AddingEdge, 'The current tool should be adding an edge');
        callback(data);
        this.network.addEdgeMode();
        this.edges.push(data);
        this.undoRedoService.addSnapshot(this.nodes, this.edges);
      },
      // Responsible for the Edit Node Label
      editNode: (nodeData: vis.Node, callback) => {
        assert(this.changesNode !== ChangingNode.None, 'The edge should not be edited when no option is selected');
        this.editNodeBasedOnCurrentNodeOption(nodeData);
        callback(nodeData);
        this.nodes=this.nodes.filter(node=> node.id!=nodeData.id);
        this.nodes.push(nodeData);
        this.undoRedoService.addSnapshot(this.nodes, this.edges);
      },
      editEdge: (edgeData: vis.Edge, callback) => {
        assert(this.changesEdge !== ChangingEdge.None, 'The edge should not be edited when no option is selected');
        this.editEdgeBasedOnCurrentEdgeOption(edgeData);
        callback(edgeData);
        this.edges = this.edges.filter(edge=> edge.id!=edgeData.id);
        this.edges.push(edgeData);
        this.undoRedoService.addSnapshot(this.nodes, this.edges);
      },
    },
    groups: {
      myGroup: {color:{background:'red'}, borderWidth:3}
    }
  };

  private editNodeBasedOnCurrentNodeOption(nodeData) {
    switch (+this.changesNode) {
      case ChangingNode.NodeLabel:{
        nodeData.label = this.nodeEdgeLabel;
        break;
      }
      case ChangingNode.NodeColor:{
        nodeData.color = this.nodeEdgeColor;
        break;
      }
    }
  }

  private editEdgeBasedOnCurrentEdgeOption(edgeData) {
    switch (+this.changesEdge) {
      case ChangingEdge.EdgeLabel:{
        edgeData.label = this.nodeEdgeLabel;
        break;
      }
      case ChangingEdge.EdgeColor:{
        edgeData.color = this.nodeEdgeColor;
        break;
      }
    }
  }

  constructor(private importExportService:ImportExportService, private undoRedoService:UndoRedoService) {
    this.undoRedoService.addSnapshot(this.nodes, this.edges);
  }

  public ngOnInit(): void {
    this.network = new vis.Network(this.graph, this.data, this.options);
    this.subscriptions.add(
      fromEvent(this.network, 'click').subscribe(params => {
        this.onClick(params);
      })
    );
  }

  /**
   * Responsible to switch the addNode button color and addNode functionality
   * on or off if the button is pressed
   */
  public addNodeInNetwork() {
    switch(+this.currentTool)
    {
      case activeTool.AddingNode : 
      {
        this.network.disableEditMode();
        this.currentTool = activeTool.Idle;
        break;
      }
      default : 
      {
        this.currentTool = activeTool.AddingNode;
        this.network.addNodeMode();
      }
    }
  }

  /**
   * Responsible to switch the addEdge button color and addEdge functionality
   * on or off if the button is pressed
   */
  public addEdgeInNetwork() {
    switch(+this.currentTool)
    {
      case activeTool.AddingEdge : 
      {
        this.network.disableEditMode();
        this.currentTool = activeTool.Idle;
        break;
      }
      default : 
      {
        this.currentTool = activeTool.AddingEdge;
        this.network.addEdgeMode();
      }
    }
  }

  /**
   * Responsible to delete the selected element if pressed while the object is highlighted
   */
  public deleteNodeOrEdgeInNetwork() {
    this.networkDeleteSelected();
    this.network.deleteSelected();
    this.undoRedoService.addSnapshot(this.nodes, this.edges);
  }

  /**
   * Delete Nodes and Edges in selection
   */
  private networkDeleteSelected() {
    let nodesToDelete: vis.IdType[] = this.network.getSelectedNodes();
    let edgesToDelete: vis.IdType[] = this.network.getSelectedEdges();
    this.deleteIdFromArray(this.nodes, nodesToDelete);
    this.deleteIdFromArray(this.edges, edgesToDelete);
    this.network.deleteSelected();
  }

  /**
   * Deletes the clicked element identified by its Id
   *
   * @param arrayToTrim
   * @param ids Needed to identify what is our selection by its Ids
   * @private
   */
  private deleteIdFromArray(arrayToTrim: vis.Node[]|vis.Edge[], ids: vis.IdType[]) {
    ids.forEach(id => {
      let index = this.IdToIndex(arrayToTrim, id)
      arrayToTrim.splice(index, 1);
    });
  }

  private IdToIndex(array: vis.Node[]|vis.Edge[], id: vis.IdType) {
    return array.findIndex(element => element.id === id);
  }

  /**
   * Defines dynamic actions when clickig on certain objects in the network
   *
   * @param params needed to distinguish the different clicked elements from each other (node or edge)
   * @private
   */
  private onClick(params) {
    // Defines node onClick actions
    if (params.nodes && params.nodes.length >= 1) {
      if (this.changesNode !== ChangingNode.None) this.network.editNode();
    }
    // Defines edge onClick actions
    if (params.edges && params.edges.length >= 1 && params.nodes.length == 0) {
      if (this.changesEdge !== ChangingEdge.None) this.network.editEdgeMode();
    }
  }

  // Boolean switch value if someone wants to change the nodeLabel name for button color
  public changeNodeName() {
    if (this.changesNode == ChangingNode.NodeColor) {
      this.isChangeNodeColor = false;
    }
    this.isChangeNodeLabel =! this.isChangeNodeLabel;
    this.changesNode = ChangingNode.NodeLabel;
    if(!this.isChangeNodeLabel) this.changesNode = ChangingNode.None;
  };

  public changeEdgeName() {
    if (this.changesEdge == ChangingEdge.EdgeColor) {
      this.isChangeEdgeColor = false;
    }
    this.isChangeEdgeLabel =! this.isChangeEdgeLabel;
    this.changesEdge = ChangingEdge.EdgeLabel;
    if(!this.isChangeEdgeLabel) this.changesEdge = ChangingEdge.None;
  };

  // Initialize network properties
  private get graph(): HTMLElement {
    return this.graphRef.nativeElement;
  }

  /**
   * Puts current nodes and edges variables into json syntax and stores it in a string.
   * Downloads the file as Graph.json with the method in importExport.service.
   */
  public exportGraph(){
    this.updateNodePositions();
    var text = "{\"nodes\":" + JSON.stringify(this.nodes) +",\"edges\":" + JSON.stringify(this.edges)+"}";
    var filename = "Graph.json";
    this.importExportService.download(filename, text);
  }

  /**
   * Before exporting the graph, get the current location of all nodes in the graph
   */
  private updateNodePositions() {
    this.nodes.forEach((node) => {
      const pos = this.network.getPosition(node.id);
      node.x = pos.x;
      node.y = pos.y;
    });
  }

  /**
   * Reads the text from an imported json file and parses it, so that it can overwrite current variables.
   * Needs delay because of the asynchronous nature of the onload function.
   * Creates a new network with the imported data.
   *
   * @param files is the file selected to import.
   */
  public importGraph(files: FileList) {
    //TODO: Missing a check that the file is valid
    this.fileToUpload = files.item(0);
    const reader = new FileReader();
    var importedJson;
    var importService = this.importExportService;
    var data;
    reader.readAsBinaryString(this.fileToUpload);

    reader.onload = function(e) {
      importedJson = e.target.result;
      const parsedImportedJson = JSON.parse(importedJson);
      data = importService.overwriteData(parsedImportedJson);
    }

    setTimeout(() => {
      this.updateData(data);
      this.undoRedoService.addSnapshot(this.nodes, this.edges);
    }, 100);
  }

  public updateData(data){
    this.nodes = data.nodes;
    this.edges = data.edges;
    this.data = data;
    this.network.setData(data);
  }

  /**
   * Declaration of the change Color method for nodes
   */
  public changeNodeColor(){
    if (this.changesNode == ChangingNode.NodeLabel) {
      this.isChangeNodeLabel = false;
    }
    this.isChangeNodeColor =! this.isChangeNodeColor;
    this.changesNode = ChangingNode.NodeColor;
    if(!this.isChangeNodeColor) this.changesNode = ChangingNode.None;
  }

  public changeEdgeColor(){
    if (this.changesEdge == ChangingEdge.EdgeLabel) {
      this.isChangeEdgeLabel = false;
    }
    this.isChangeEdgeColor =! this.isChangeEdgeColor;
    this.changesEdge = ChangingEdge.EdgeColor;
    if(!this.isChangeEdgeColor) this.changesEdge = ChangingEdge.None;
  }

  public undo(){
    this.updateData(this.undoRedoService.getPredecessorSnapshot())
  }

  public redo(){
    this.updateData(this.undoRedoService.getSuccessorSnapshot())
  }
}
