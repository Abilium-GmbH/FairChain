import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { fromEvent, Subscription } from 'rxjs';
import {MatDialog, MatDialogConfig} from '@angular/material/dialog';
import * as vis from 'vis-network';

@Component({
  selector: 'app-example',
  templateUrl: './example.component.html',
  styleUrls: ['./example.component.scss']
})
export class ExampleComponent implements OnInit {
  showOptions = false;
  addingNodes = false;
  addingEdges = false;
  physicsOn = true;
  deletingNodesOrEdges = false;

  // create an array with nodes
  private nodes: vis.Node[] = [];

  // create an array with edges
  private edges: vis.Edge[] = [];

  // create a network
  private data: vis.Data = {
    nodes: this.nodes,
    edges: this.edges,
  };
  private options: vis.Options = {
    nodes: {
      shape: 'box'
    },
    edges: {
      smooth: true,
      physics: false
    },
    manipulation: {
      addNode: (data, callback) => {
        this.nodes.push(data);
        callback(data);
        if (this.addingNodes) {
          this.network.addNodeMode();
        }
      },
      editNode: (data, callback) => {
        data.label = this.nodeLabel;
        callback(data);
        console.log("yay");
      },
      addEdge: (data, callback) => {
        callback(data);
        if (this.addingEdges) {
          this.network.addEdgeMode();
        }
      }
      /*
      deleteNodeOrEdge: (data, callback) => {
        callback(data);
        if (this.deletingNodesOrEdges) {
          this.network.deleteSelected();
        }
      }
      */
    }
  };

  addingNode(data, callback) {
    this.nodes.push(data)
    callback(data);
    if (this.addingNodes) {
      this.network.addNodeMode();
    }
  }

  editingNode(data, callback) {
    data.label = this.nodeLabel;
    callback(data);
  }
  nodeLabel = "";
  changeNodeLabel = false;
  changeName() {
    this.changeNodeLabel = !this.changeNodeLabel;
  }

  private network: vis.Network;

  public showNodeOptions = false;

  private subscriptions: Subscription = new Subscription();

  @ViewChild('graph', {static: true}) graphRef: ElementRef;
  @ViewChild('nodeOptions', {static: true}) nodeOptionsRef: ElementRef;

  constructor(private dialog: MatDialog) { }

  ngOnInit(): void {
    this.network = new vis.Network(this.graph, this.data, this.options);


    this.subscriptions.add(
      fromEvent(this.network, 'click').subscribe(params => {
        this.onClick(params);
      })
    );
  }


  unselectSelectedNodes() {
    this.network.unselectAll();
    this.showNodeOptions = false;
  }

  // Component needs to be exchanged
  editSelectedNode() {
    this.dialog.open(ExampleComponent);

  }
/*
  deleteNodeOrEdge() {
    this.network.deleteSelected();
    this.showNodeOptions = false;
  }
*/

  private onClick(params) {
    console.log(params);
    if (params.nodes && params.nodes.length >= 1) {
      const node = this.nodes.find(node => node.id === params.nodes[0]);
      if (this.changeNodeLabel) {console.log("gray"); this.network.editNode()};
      const position = this.network.getPosition(node.id);

      const x = params.pointer.DOM.x - (params.pointer.canvas.x - position.x);
      const y = params.pointer.DOM.y - (params.pointer.canvas.y - position.y);

      this.nodeOptions.style.left = x + 'px';
      this.nodeOptions.style.top = y + 'px';
      this.showNodeOptions = true;
    } else {
      this.showNodeOptions = false;
    }
  }

  addNode() {
    if (this.addingNodes) {
      this.addingNodes = false;
      this.network.disableEditMode();
    } else {
      this.addingEdges = false;
      this.addingNodes = true;
      this.network.addNodeMode();
    }
  }

  addEdge() {
    if (this.addingEdges) {
      this.addingEdges = false;
      this.network.disableEditMode();
    } else {
      this.addingNodes = false;
      this.addingEdges = true;
      this.network.addEdgeMode();
    }
  }

  deleteNodeOrEdge() {
    if (this.deletingNodesOrEdges) {
      this.deletingNodesOrEdges = false;
      this.network.disableEditMode();
    } else {
      this.deletingNodesOrEdges = false;
      this.network.deleteSelected();
    }
  }

  turnOffOrOn(){
    this.physicsOn = ! this.physicsOn;
    this.options.physics.enabled = ! this.options.physics.enabled;
  }
  moveEdge() {
    this.network.editEdgeMode();
  }
  changeVisibilityOfOptions(){
    this.showOptions = ! this.showOptions;
  }

  // Neue Component ersetzen

  editNode() {
    this.dialog.open(ExampleComponent);
  }



  private get graph(): HTMLElement {
    return this.graphRef.nativeElement;
  }

  private get nodeOptions(): HTMLElement {
    return this.nodeOptionsRef.nativeElement;
  }
}
