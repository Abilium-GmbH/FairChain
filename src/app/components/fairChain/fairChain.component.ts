import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { fromEvent, Subscription } from 'rxjs';
import { ImportExportService } from '../../importExport.service'
import * as vis from 'vis-network';
import { strict as assert } from 'assert';

enum activeTool {
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
  providers: [ ImportExportService ]
})

/**
 * This Component has many responsibilities. So far, it holds the basic Implementations of theProject,
 * such like addNode, addEdge, deleteSelection, edit NodeLabel and edge Label
 */
export class FairChainComponent implements OnInit {

  groups = NodeGroups;
  enumKeys = [];

  change(value: string) {
    this.selectedGroup = this.groups[value];
  }

  public isAddingNode() : boolean {return this.currentTool === activeTool.AddingNode;}
  public isAddingEdge() : boolean {return this.currentTool === activeTool.AddingEdge;}

  public isChangeNodeColor = false;
  public isChangeEdgeColor = false;
  public isDeletingNodesOrEdges = false;
  public isChangeNodeLabel = false;
  public isChangeEdgeLabel = false;
  public isShowNodeOptions = false;
  public isChangeNodeGroup = false;

  public testClassCSS = false;

  // A handy debug buttom for any
  public isDebugging = true;
  public __debug__() {assert(this.isDebugging, 'Function should not be called unless in debug mode'), console.log(this.isAddingNode());}

  public nodeEdgeLabel = "";
  public nodeEdgeColor = "#002AFF";
  public selectedGroup = "Group1";

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
      addNode: (data: vis.Node, callback) => {
        assert(this.currentTool === activeTool.AddingNode, 'The current tool should be adding a node')
        data.group = this.selectedGroup.toLowerCase();


        //data.color = "orange";


        this.nodes.push(data);
        callback(data);
        this.network.addNodeMode();
      },
      // Defines logic for Add Edge functionality
      addEdge: (data: vis.Edge, callback) => {
        assert(this.currentTool === activeTool.AddingEdge, 'The current tool should be adding an edge');
        callback(data);
        this.network.addEdgeMode();
        this.edges.push(data);
      },
      // Responsible for the Edit Node Label
      editNode: (nodeData: vis.Node, callback) => {
        assert(this.changesNode !== ChangingNode.None, 'The edge should not be edited when no option is selected');
        this.editNodeBasedOnCurrentNodeOption(nodeData);
        this.nodes=this.nodes.filter(node=> node.id!=nodeData.id);
        this.nodes.push(nodeData);
        callback(nodeData);
        //this.network.setData({nodes: this.nodes, edges: this.edges});
      },
      editEdge: (edgeData: vis.Edge, callback) => {
        assert(this.changesEdge !== ChangingEdge.None, 'The edge should not be edited when no option is selected');
        this.editEdgeBasedOnCurrentEdgeOption(edgeData);
        callback(edgeData);
        this.edges = this.edges.filter(edge=> edge.id!=edgeData.id);
        this.edges.push(edgeData);
      },
    },
  };

  public changeGroup1ColorInBlack() {
    this.options.groups.group1.color = "black";
    this.network.setOptions(this.options);
  }

  private editNodeBasedOnCurrentNodeOption(nodeData: vis.Node) {
    switch (+this.changesNode) {
      case ChangingNode.NodeLabel: {
        nodeData.label = this.nodeEdgeLabel;
        break;
      }
      case ChangingNode.NodeColor: {
        nodeData.color = this.nodeEdgeColor;
        break;
      }
      case ChangingNode.NodeGroup: {
        this.updateNodeGroup(nodeData);
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

  constructor(private importExportService:ImportExportService) {
    this.enumKeys = Object.keys(this.groups).filter(f => !isNaN(Number(f)));
    console.log("keys =", this.enumKeys);
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
      importService.overwriteData(parsedImportedJson);
      data = importService.getData();
    }

    setTimeout(() => {
      this.nodes = data.nodes;
      this.edges = data.edges;
      this.data = data;
      this.network.setData(data);
    }, 100);
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
  public changeNodeGroup() {
    this.changesNode = ChangingNode.NodeGroup;
    this.isChangeNodeGroup =! this.isChangeNodeGroup;
    //this.selectedGroup = document.getElementById("groups");
    this.network.editNode();
    //this.changesNode = ChangingNode.None;
  }

  public updateNodeGroup(node: vis.Node) {
    switch (this.selectedGroup) {
      case "Group1": {
        //node.group = this.selectedGroup.toLowerCase();
        //node.color = this.options.groups.group1.color;
        this.network.updateClusteredNode(node.id, {group: "group1"});
        break;
      }
      case "Group2": {
        /*node.group = this.selectedGroup.toLowerCase();
        node.color = this.options.groups.group2.color;
        break;

         */
        this.network.updateClusteredNode(node.id, {group: "group2"});
        break;
      }
      case "Group3": {
        /*node.group = this.selectedGroup.toLowerCase();
        node.color = this.options.groups.group3.color;*/
        this.network.updateClusteredNode(node.id, {group: "group3"});
        break;
      }
    }
  }
}
