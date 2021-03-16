import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { enableDebugTools } from '@angular/platform-browser';
import { fromEvent, Subscription } from 'rxjs';
import { callbackify } from 'util';
import * as vis from 'vis-network'

@Component({
  selector: 'app-example',
  templateUrl: './example.component.html',
  styleUrls: ['./example.component.scss']
})
export class ExampleComponent implements OnInit {
  showOptions: boolean = false;
  addingNodes: boolean = false;
  addingEdges: boolean = false;
  physicsOn: boolean = true;
  deletingNodesOrEdges: boolean = false;

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
      deleteNodeOrEdge: (data, callback) => {
        callback(data);
        if (this.deletingNodesOrEdges) {
          this.network.deleteSelected();
        }
      }
    },
    configure:{
      enabled: true,
    filter: 'nodes,edges',
    container: undefined,
    showButton: true
    }
  };
  private network: vis.Network;

  public showNodeOptions: boolean = false;

  private subscriptions: Subscription = new Subscription();

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
/*
  deleteSelectedNodes() {
    this.network.deleteSelected();
    this.showNodeOptions = false;
  }

  unselectSelectedNodes() {
    this.network.unselectAll();
    this.showNodeOptions = false;
  }

  deleteNodeOrEdge() {
    this.network.deleteSelected();
    this.showNodeOptions = false;
  }
*/

  private onClick(params) {
    if (params.nodes && params.nodes.length >= 1) {
      const node = this.nodes.find(node => node.id == params.nodes[0]);
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
      this.addingNodes = true;
      this.network.addNodeMode();
    }
  }

  addEdge() {
    if (this.addingEdges) {
      this.addingEdges = false;
      this.network.disableEditMode();
    } else {
      this.addingEdges = true;
      this.network.addEdgeMode();
    }
  }

  deleteNodeOrEdge() {
    if (this.deletingNodesOrEdges) {
      this.deletingNodesOrEdges = false;
      this.network.disableEditMode();
    } else {
      this.deletingNodesOrEdges = true;
      this.network.deleteSelected();
    }
  }

  turnOffOrOn(){
    this.physicsOn=!this.physicsOn;
    this.options.physics.enabled=!this.options.physics.enabled;
  }
  moveEdge() {
    this.network.editEdgeMode();
  }
  changeVisibilityOfOptions(){
    this.showOptions=!this.showOptions
  }

  private get graph(): HTMLElement {
    return this.graphRef.nativeElement;
  }

  private get nodeOptions(): HTMLElement {
    return this.nodeOptionsRef.nativeElement;
  }
}
