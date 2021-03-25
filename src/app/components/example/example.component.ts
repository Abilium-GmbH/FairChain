import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { fromEvent, Subscription } from 'rxjs';
import * as vis from 'vis-network';

@Component({
  selector: 'app-example',
  templateUrl: './example.component.html',
  styleUrls: ['./example.component.scss']
})
export class ExampleComponent implements OnInit {
  public showOptions = false;
  public addingNodes = false;
  public addingEdges = false;
  public deletingNodesOrEdges = false;
  public nodeLabel = "";
  public changeNodeLabel = false;
  public showNodeOptions = false;

  private network: vis.Network;
  private subscriptions: Subscription = new Subscription();

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
      shape: 'box',
      physics: false
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
      addEdge: (data, callback) => {
        callback(data);
        if (this.addingEdges) {
          this.network.addEdgeMode();
        }
      },
      editNode: (data, callback) => {
        data.label = this.nodeLabel;
        callback(data);
      },
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

  changeName() {
    this.changeNodeLabel = !this.changeNodeLabel;
  }

  @ViewChild('graph', {static: true}) graphRef: ElementRef;
  @ViewChild('nodeOptions', {static: true}) nodeOptionsRef: ElementRef;

  constructor() { }

  ngOnInit(): void {
    this.network = new vis.Network(this.graph, this.data, this.options);

    this.subscriptions.add(
      fromEvent(this.network, 'click').subscribe(params => {
        this.onClick(params);
      })
    );
  }

  private onClick(params) {
    if (params.nodes && params.nodes.length >= 1) {
      if (this.changeNodeLabel) this.network.editNode();
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
      this.showNodeOptions = false;
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
      this.showNodeOptions = false;
    }
  }

  deleteNodeOrEdge() {
    if (this.deletingNodesOrEdges) {
      this.network.disableEditMode();
    } else {
      this.network.deleteSelected();
      this.showNodeOptions = false;
    }
  }

  changeVisibilityOfOptions(){
    this.showOptions = ! this.showOptions;
  }

  private get graph(): HTMLElement {
    return this.graphRef.nativeElement;
  }
}



