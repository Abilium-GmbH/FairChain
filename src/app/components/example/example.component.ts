import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { fromEvent, Subscription } from 'rxjs';
import * as vis from 'vis-network'

@Component({
  selector: 'app-example',
  templateUrl: './example.component.html',
  styleUrls: ['./example.component.scss']
})
export class ExampleComponent implements OnInit {

  // create an array with nodes
  private nodes: vis.Node[] = [
    { id: 1, label: "Node 1" },
    { id: 2, label: "Node 2" },
    { id: 3, label: "Node 3" },
    { id: 4, label: "Node 4" },
    { id: 5, label: "Node 5" },
  ];

  // create an array with edges
  private edges: vis.Edge[] = [
    { id: 1, from: 1, to: 3 },
    { id: 2, from: 1, to: 2 },
    { id: 3, from: 2, to: 4 },
    { id: 4, from: 2, to: 5 },
    { id: 5, from: 3, to: 3 },
  ];

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

  deleteSelectedNodes() {
    this.network.deleteSelected();
    this.showNodeOptions = false;
  }

  unselectSelectedNodes() {
    this.network.unselectAll();
    this.showNodeOptions = false;
  }

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

  private get graph(): HTMLElement {
    return this.graphRef.nativeElement;
  }

  private get nodeOptions(): HTMLElement {
    return this.nodeOptionsRef.nativeElement;
  }
}
