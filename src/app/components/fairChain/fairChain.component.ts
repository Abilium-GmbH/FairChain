import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MatLabel } from '@angular/material/form-field';
import { fromEvent, Subscription } from 'rxjs';
import * as vis from 'vis-network';
import {colors} from '@angular/cli/utilities/color';
import set = Reflect.set;
import {parseColor} from 'vis-util';

enum Changing {
  NodeLabel, EdgeLabel, NodeColor,
  None
}

@Component({
  selector: 'app-fairChain',
  templateUrl: './fairChain.component.html',
  styleUrls: ['./fairChain.component.scss']
})

/**
 * This Component has many responsibilities, which makes him a god class, has to be split in multiple objects.
 * So far, it holds the basic Implementations of the Project, such like addNode, addEdge, deleteSelection and
 * Edit NodeLabel.
 *
  */


export class FairChainComponent implements OnInit {

  public isChangeNodeColor = false;
  public isAddingNodes = false;
  public isAddingEdges = false;
  public isDeletingNodesOrEdges = false;
  public nodeLabel = "";
  public edgeLabel = "";
  public nodeColor = "#002AFF";
  public isChangeNodeLabel = false;
  public isChangeEdgeLabel = false;
  public isShowNodeOptions = false;
  @ViewChild('graph', {static: true}) graphRef: ElementRef;
  @ViewChild('nodeOptions', {static: true}) nodeOptionsRef: ElementRef;
  private network: vis.Network;
  private subscriptions: Subscription = new Subscription();
  private changes: Changing;
  // create an array with nodes
  private nodes: vis.Node[] = [];

  // create an array with edges
  private edges: vis.Edge[] = [];

/*
  private edgeSamples = new vis.DataSet([
    {
    id: 1,
    label: 'Green',
    color: {
      border: 'green',
      background: 'green'
    }
  }, {
    id: 2,
    label: 'Red',
    color: {
      border: 'red',
      background: 'red'
    }
  }]);
 */

  /*
  private edgeOptions: {
    edges: {
      hoverWidth: function(width) {
      return width+1;
      }
    }
  };

   */

/*
  //
  private edgeEditColor: vis.Color[] = [
    { border: 'green', background: 'green' },
    { border: 'light red', background: 'red' },
    { border: 'black', background: 'black' }
  ];


 */




  // create a network
  private data: vis.Data = {
    nodes: this.nodes,
    edges: this.edges,
  };

  // Initializes Node and Edge Properties
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
      physics: true,
      arrows: {
        to: {
         enabled: false,
        }
      }
    },
    manipulation: {
      // defines logic for Add Node functionality
      addNode: (data, callback) => {
        callback(data);
        if (this.isAddingNodes) {
          this.network.addNodeMode();
        }
        this.nodes.push(data)
      },
      // Defines logic for Add Edge functionality
      addEdge: (data, callback) => {
        callback(data);
        if (this.isAddingEdges) {
          this.network.addEdgeMode();
          this.nodes.push(data)
        }
      },
      // Responsible for the Edit Node Label
      editNode: (nodeData, callback) => {
        switch (+this.changes) {
          case Changing.NodeLabel:{
            nodeData.label = this.nodeLabel;
            break;
          }
          case Changing.NodeColor:{
            nodeData.color=this.nodeColor;
            break;
          }
        }
        callback(nodeData);
        this.nodes.forEach(node => {
          if (node.id==nodeData.id) node=nodeData
        })
      },
      editEdge: (data, callback) => {
      /*
        data.color = 'red';
      */
        data.label = this.nodeLabel;
        callback(data);
      }
    },
    groups: {
      myGroup: {color:{background:'red'}, borderWidth:3}
    }
  };

  constructor() { }

  public ngOnInit(): void {
    this.network = new vis.Network(this.graph, this.data, this.options);
    this.subscriptions.add(
      fromEvent(this.network, 'click').subscribe(params => {
        this.onClick(params);
      })
    );
  }

  // Responsible to switch the button addNode color and addNode functionality on or off
  // if the button is pressed
  public addNodeInNetwork() {
    if (this.isAddingNodes) {
      this.isAddingNodes = false;
      this.network.disableEditMode();
    } else {
      this.isAddingEdges = false;
      this.isAddingNodes = true;
      this.network.addNodeMode();
      this.isShowNodeOptions = false;
    }
  }

  // Responsible to switch the button addEdge color and addEdge functionality on or off
  // if the button is pressed
  public addEdgeInNetwork() {
    if (this.isAddingEdges) {
      this.isAddingEdges = false;
      this.network.disableEditMode();
    } else {
      this.isAddingNodes = false;
      this.isAddingEdges = true;
      this.network.addEdgeMode();
      this.isShowNodeOptions = false;
    }
  }

  // Responsible to delete the selected element if pressed while the object is highlighted
  public deleteNodeOrEdgeInNetwork() {
    if (this.isDeletingNodesOrEdges) {
      this.network.disableEditMode();
    } else {
      this.isAddingNodes = false;
      this.isAddingEdges = false;
      this.network.deleteSelected();
      this.isShowNodeOptions = false;
    }
  }

  // Defines actions when user clicks on Nodes or Edges
  private onClick(params) {
    if (params.nodes && params.nodes.length >= 1) {
      if (this.changes==Changing.NodeLabel) this.network.editNode();
      if (this.changes==Changing.NodeColor) this.network.editNode();
    }
    if (params.edges && params.edges.length >= 1 && params.nodes.length == 0) {
      if (this.isChangeEdgeLabel) {
        this.network.editEdgeMode();
      }
    }



  }
    /*
    if (this.onClick.length = 2) {
      this.network.deleteSelected();
    }

     */


  // Boolean switch value if someone wants to change the nodeLabel name for button color
  public changeNodeName() {
    if (this.changes == Changing.NodeColor) {
      this.isChangeNodeColor = false;
    }
    this.isChangeNodeLabel = !this.isChangeNodeLabel;
    this.isChangeEdgeLabel = !this.isChangeEdgeLabel;
    this.changes=Changing.NodeLabel
    if(!this.isChangeNodeLabel) this.changes=Changing.None
  };

/*
  public nodeID = params.nodes['nodes']['0'];
  if (nodeID) {
    var clickedNode = this.nodes.find(nodeID);
    clickedNode.color = {
      border: '#000000',
      background: '#000000',
      highlight: {
        border: '#2B7CE9',
        background: '#D2E5FF'
      }
    }
    this.nodes.push(clickedNode);
  }
*/

  // initialize network properties
  private get graph(): HTMLElement {
    return this.graphRef.nativeElement;
  }

  public changeColor(){
    if (this.changes == Changing.NodeLabel) {
      this.isChangeNodeLabel = false;
    }
    this.isChangeNodeColor =! this.isChangeNodeColor;
    this.changes = Changing.NodeColor;
    if(!this.isChangeNodeColor) this.changes = Changing.None
  }
}



