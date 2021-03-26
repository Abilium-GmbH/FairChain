import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { fromEvent, Subscription } from 'rxjs';
import * as vis from 'vis-network';

@Component({
  selector: 'app-example',
  templateUrl: './example.component.html',
  styleUrls: ['./example.component.scss']
})

/**
 * This Component has many responsibilities, which makes him a god class, has to be split in multiple objects.
 * So far, it holds the basic Implementations of the Project, such like addNode, addEdge, deleteSelection and
 * Edit NodeLabel.
 *
  */


export class ExampleComponent implements OnInit {

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
  // Initializes Node and Edge Properties
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
      // Responsible for Add edge button logic
      addNode: (data, callback) => {
        callback(data);
        if (this.addingNodes) {
          this.network.addNodeMode();
        }
      },
      // Responsible for Add edge button logic
      addEdge: (data, callback) => {
        callback(data);
        if (this.addingEdges) {
          this.network.addEdgeMode();
        }
      },
      // Responsible for the Edit Node Label
      editNode: (data, callback) => {
        data.label = this.nodeLabel;
        callback(data);
      },
    }
  };

  // Responsible for the add Node functionality, calls addNode method
  addingNode(data, callback) {
    this.nodes.push(data); // Pushes Node data in array when added
    callback(data);
    if (this.addingNodes) {
      this.network.addNodeMode();
    }
  }

  // Defines the nodeLabel properties when called
  editingNode(data, callback) {
    data.label = this.nodeLabel;
    callback(data);
  }

  // Boolean switch value if someone wants to change the nodeLabel name for button color
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

  // Defines actions when user clicks on Nodes or Edges
  private onClick(params) {
    if (params.nodes && params.nodes.length >= 1) {
      if (this.changeNodeLabel) this.network.editNode();
    }
  }

  // Responsible to switch the button addNode color and addNode functionality on or off
  // if the button is pressed
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

  // Responsible to switch the button addEdge color and addEdge functionality on or off
  // if the button is pressed
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

  // Responsible to delete the selected element if pressed while the object is highlighted
  deleteNodeOrEdge() {
    if (this.deletingNodesOrEdges) {
      this.network.disableEditMode();
    } else {
      this.network.deleteSelected();
      this.showNodeOptions = false;
    }
  }

  // initialize network properties
  private get graph(): HTMLElement {
    return this.graphRef.nativeElement;
  }
}



