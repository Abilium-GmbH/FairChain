import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { fromEvent, Subscription } from 'rxjs';
import { ImportExportService } from '../../importExport.service'
import { UndoRedoService } from 'src/app/undoRedo.service';
import { strict as assert } from 'assert';

import { Network, Node, Edge, Data, Options, IdType, DataSetNodes, DataSetEdges } from "vis-network/peer/esm/vis-network";
import { DataSet } from "vis-data/peer/esm/vis-data"

enum Tools {
  AddingNode, AddingEdge, Idle
}

enum ChangingNode {
  NodeLabel,  NodeColor, NodeGroup, None
}

enum ChangingEdge {
  EdgeLabel, EdgeColor, None
}
enum NodeGroups {
  Group1, Group2, Group3, None
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

  public ngOnInit(): void {
    this.network = new Network(this.graph, this.data, this.options);
    this.makeSubscriptions();
  }

  constructor(private importExportService:ImportExportService, private undoRedoService:UndoRedoService) {
    this.undoRedoService.addSnapshot(this.nodes, this.edges);
    this.enumKeys = Object.keys(this.groups).filter(f => !isNaN(Number(f)));
  }

  private makeSubscriptions(): void {
    this.subscriptions = new Subscription();
    this.subscriptions.add(
      fromEvent(this.network, 'click').subscribe(params => {
        this.onClick(params);
      })
    );
    this.subscriptions.add(
      fromEvent(this.network, 'dragEnd').subscribe(params => {
        this.onDragEnd(params);
      })
    );
  }

  public isAddingNode() : boolean {return this.currentTool === Tools.AddingNode;}
  public isAddingEdge() : boolean {return this.currentTool === Tools.AddingEdge;}
  public isChangingNodeLabel() : boolean {return this.changesNode === ChangingNode.NodeLabel;}
  public isChangingEdgeLabel() : boolean {return this.changesEdge === ChangingEdge.EdgeLabel;}
  public isChangingColor() : boolean {return this.changesNode === ChangingNode.NodeColor;}
  public isInNodeEditMode() : boolean {return this.changesNode !== ChangingNode.None;}
  public isInEdgeEditMode() : boolean {return this.changesNode !== ChangingNode.None;}
  private stopEditMode() : void {this.changesNode = ChangingNode.None; this.changesEdge = ChangingEdge.None;}
  private makeToolIdle() : void {this.currentTool = Tools.Idle;}
  private isChangingGroup(): boolean {return this.changesNode===ChangingNode.NodeGroup}

  // A handy debug buttom for any
  groups = NodeGroups;
  enumKeys = [];

  change(value: string) {
    this.selectedGroup = this.groups[value];
  }

  public isDebugging = true;
  public __debug__()
  {
    assert(this.isDebugging, 'Function should not be called unless in debug mode');
    console.log(this.currentTool);
  }

  public nodeEdgeLabel = "";
  public nodeEdgeColor = "#002AFF";
  public selectedGroup = "Group1";

  @ViewChild('graph', {static: true}) graphRef: ElementRef;

  private network: Network;
  private subscriptions: Subscription;

  private changesNode: ChangingNode = ChangingNode.None;
  private changesEdge: ChangingEdge = ChangingEdge.None;
  private currentTool: Tools = Tools.Idle;


  // Create an array with nodes
  //private nodes: Node[] = [];
  private nodes: DataSetNodes = new DataSet();

  // Create an array with edges
  private edges: DataSetEdges = new DataSet();

  // Create a network
  private data: Data = {
    nodes: this.nodes,
    edges: this.edges,
  };

  /**
   * Initializes Node and Edge Properties
   *
   * @private
   */
  private options: Options = {
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
    physics: {
      barnesHut: {
        theta: 0.5,
        gravitationalConstant: -200,
        centralGravity: 0,
        damping: 1,
        avoidOverlap: 1
      },
      maxVelocity: 10,
      minVelocity: 10,
    },
    groups: {
      group1: {
        color: "red"
      },
      group2: {
        color: "green"
      },
      group3: {
        color: "yellow"
      }
    },
    manipulation: {
      // Defines logic for Add Node functionality
      addNode: (data: Node, callback) => {
        assert(this.isAddingNode(), 'The current tool should be adding a node');
        callback(data);
        this.network.addNodeMode();
        this.makeSnapshot();
      },
      // Defines logic for Add Edge functionality
      addEdge: (data: Edge, callback) => {
        assert(this.isAddingEdge(), 'The current tool should be adding an edge');
        callback(data);
        this.network.addEdgeMode();
        this.makeSnapshot();
      },
      // Responsible for the Edit Node Label
      editNode: (nodeData: Node, callback) => {
        assert(this.isInNodeEditMode(), 'The node should not be edited when no option is selected');
        this.editNodeBasedOnCurrentNodeOption(nodeData);
        callback(nodeData);
        this.makeSnapshot();
      },
      editEdge: (edgeData: Edge, callback) => {
        console.log('yay');
        assert(this.isInEdgeEditMode(), 'The edge should not be edited when no option is selected');
        this.editEdgeBasedOnCurrentEdgeOption(edgeData);
        callback(edgeData);
        this.makeSnapshot();
      },
    },
  };

  private editNodeBasedOnCurrentNodeOption(nodeData: Node) {
    if (this.isChangingNodeLabel()) nodeData.label = this.nodeEdgeLabel;
    if (this.isChangingColor()) nodeData.color = this.nodeEdgeColor;
    if (this.changesNode === ChangingNode.NodeGroup) this.updateNodeGroup(nodeData);
  }

  public changeGroup1ColorInBlack() {
    this.options.groups.group1.color = "black";
    this.network.setOptions(this.options);
  }

  private editEdgeBasedOnCurrentEdgeOption(edgeData: Edge) {
    if (this.isChangingEdgeLabel()) {edgeData.label = this.nodeEdgeLabel; console.log('yay');}
    if (this.isChangingColor()) edgeData.color = this.nodeEdgeColor;
  }

  /**
   * Responsible to switch the addNode button color and addNode functionality
   * on or off if the button is pressed
   */
  public addNodeInNetwork() {

    this.stopEditMode();
    if (this.isAddingNode()) {
      this.currentTool = Tools.Idle;
      this.network.disableEditMode();
    } else {
      this.currentTool = Tools.AddingNode;
      this.network.addNodeMode();
    }
  }

  /**
   * Responsible to switch the addEdge button color and addEdge functionality
   * on or off if the button is pressed
   */
  public addEdgeInNetwork() {
    this.stopEditMode();
    if (this.isAddingEdge()) {
      this.currentTool = Tools.Idle;
      this.network.disableEditMode();
    } else {
      this.currentTool = Tools.AddingEdge;
      this.network.addEdgeMode();
    }
  }

  /**
   * Delete Nodes and Edges in selection
   */
  public deleteNodeOrEdgeInNetwork() {
    this.network.deleteSelected();
    this.makeSnapshot();
  }

  /**
   * Defines dynamic actions when clickig on certain objects in the network
   *
   * @param params needed to distinguish the different clicked elements from each other (node or edge)
   * @private
   */
  private onClick(params) {
    // Defines node onClick actions
    if (this.isClickingOnNodeInNodeEditMode(params)) this.network.editNode();
    // Defines edge onClick actions
    //TODO: With new edge dataset, define custom events for changing labels/color
    if (this.isClickingOnEdgeInEdgeEditMode(params)) this.editEdgeInDataset(params.edges);
  }

  private editEdgeInDataset(edges: IdType[]) {
    edges.forEach((id) => {
      let edgeData: Edge = this.edges.get(id);
      this.editEdgeBasedOnCurrentEdgeOption(edgeData);
      this.edges.update(edgeData);
    });
    this.network.disableEditMode();
  }

  private isClickingOnNodeInNodeEditMode(params): boolean {
    return params.nodes
      && params.nodes.length >= 1
      && this.isInNodeEditMode()
  }

  private isClickingOnEdgeInEdgeEditMode(params): boolean {
    return params.edges
      && params.edges.length >= 1
      && this.isInEdgeEditMode()
  }

  private onDragEnd(params) {
    if (params.nodes && params.nodes.length >= 1) {
      this.makeSnapshot();
    }
  }

  // Boolean switch value if someone wants to change the nodeLabel name for button color
  public changeNodeName() {
    this.makeToolIdle();
    if (this.isChangingNodeLabel()) this.changesNode = ChangingNode.None;
    else this.changesNode = ChangingNode.NodeLabel;
  };

  public changeEdgeName() {
    this.makeToolIdle();
    if (this.isChangingEdgeLabel()) this.changesEdge = ChangingEdge.None;
    else this.changesEdge = ChangingEdge.EdgeLabel;
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
    var text = this.importExportService.convertNetworkToJSON(this.nodes, this.edges);
    var filename = "Graph.json";
    this.importExportService.download(filename, text);
  }

  /**
   * Reads the text from an imported json file and parses it, so that it can overwrite current variables.
   * Needs delay because of the asynchronous nature of the onload function.
   * Creates a new network with the imported data.
   *
   * @param files is the file selected to import.
   */
  public async importGraph(files: FileList) {
    //TODO: Missing a check that the file is valid
    this.updateData( await this.importExportService.upload(files.item(0)));
    this.makeSubscriptions();
    this.makeSnapshot();
  }

  public updateData(data){
    this.nodes = new DataSet();
    this.nodes.add(data.nodes);

    this.edges = new DataSet();
    this.edges.add(data.edges);

    this.data = {nodes: this.nodes, edges: this.edges};
    this.network = new Network(this.graph, this.data, this.options);
    this.makeSubscriptions();
  }

  /**
   * Declaration of the change Color method for nodes
   */
  public changeNodeColor(){
    this.makeToolIdle();
    if (this.isChangingColor()) this.changesNode = ChangingNode.None;
    else this.changesNode = ChangingNode.NodeColor;
  }

  public changeEdgeColor(){
    this.makeToolIdle();
    if (this.isChangingColor()) this.changesEdge = ChangingEdge.None;
    else this.changesEdge = ChangingEdge.EdgeColor;
  }

  private makeSnapshot(){
    this.undoRedoService.addSnapshot(this.nodes, this.edges);
  }

  public undo(){
    this.updateData(this.undoRedoService.getPredecessorSnapshot())
  }

  public redo(){
    this.updateData(this.undoRedoService.getSuccessorSnapshot())
  }

  public changeNodeGroup() {
    this.makeToolIdle();
    if (this.isChangingGroup()) this.changesEdge = ChangingEdge.None;
    //this.selectedGroup = document.getElementById("groups");
    else this.changesNode=ChangingNode.NodeGroup;
    //this.changesNode = ChangingNode.None;
  }

  public updateNodeGroup(node: Node) {
    switch (this.selectedGroup) {
      case "Group1": {
        //node.group = this.selectedGroup.toLowerCase();
        //node.color = this.options.groups.group1.color;
        this.network.updateClusteredNode(node.id, {group: "group1"});
        break;
      }
      case "Group2": {
        //node.group = this.selectedGroup.toLowerCase();
        //node.color = this.options.groups.group2.color;
        //break;


        this.network.updateClusteredNode(node.id, {group: "group2"});
        break;
      }
      case "Group3": {
        /*
        node.group = this.selectedGroup.toLowerCase();
        node.color = this.options.groups.group3.color;
         */
        this.network.updateClusteredNode(node.id, {group: "group3"});
        break;
      }
    }
  }
}

