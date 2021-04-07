import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { fromEvent, Subscription } from 'rxjs';
import { ImportExportService } from '../../importExport.service'
import * as vis from 'vis-network';
import { setClassMetadata } from '@angular/core/src/r3_symbols';
import { Network } from 'vis-network';

@Component({
  selector: 'app-fairChain',
  templateUrl: './fairChain.component.html',
  styleUrls: ['./fairChain.component.scss'],
  providers: [ ImportExportService ]
})

/**
 * This Component has many responsibilities, which makes him a god class, has to be split in multiple objects.
 * So far, it holds the basic Implementations of the Project, such like addNode, addEdge, deleteSelection and
 * Edit NodeLabel.
 *
  */


export class FairChainComponent implements OnInit {

  public isAddingNodes = false;
  public isAddingEdges = false;
  public isDeletingNodesOrEdges = false;
  public nodeLabel = "";
  public isChangeNodeLabel = false;
  public isShowNodeOptions = false;
  @ViewChild('graph', {static: true}) graphRef: ElementRef;
  @ViewChild('nodeOptions', {static: true}) nodeOptionsRef: ElementRef;
  private network: vis.Network;
  private subscriptions: Subscription = new Subscription();

  // create an array with nodes
  // TODO: Position of node are not correct, maybe not important
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
      // defines logic for Add Node functionality
      addNode: (data, callback) => {
        callback(data);
        this.nodes.push(data);
        if (this.isAddingNodes) {
          this.network.addNodeMode();
        }
      },
      // Defines logic for Add Edge functionality
      addEdge: (data, callback) => {
        callback(data);
        this.edges.push(data);
        if (this.isAddingEdges) {
          this.network.addEdgeMode();
        }
      },
      // Responsible for the Edit Node Label
      editNode: (data, callback) => {
        data.label = this.nodeLabel;
        callback(data);
        this.nodes=this.nodes.filter(node=> node.id!=data.id)
        this.nodes.push(data)
      },
    },

  };

  constructor(private importExportService:ImportExportService) { }

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
      this.networkDeleteSelected();
      this.isShowNodeOptions = false;
    }
  }

  //Delete Nodes and Edges in selection
  private networkDeleteSelected() {
    let nodesToDelete: vis.IdType[] = this.network.getSelectedNodes();
    let edgesToDelete: vis.IdType[] = this.network.getSelectedEdges();
    this.deleteIdFromArray(this.nodes, nodesToDelete);
    this.deleteIdFromArray(this.edges, edgesToDelete);
    this.network.deleteSelected();
  }

  //Delete Elements that have specific id
  private deleteIdFromArray(arrayToTrim: vis.Node[]|vis.Edge[], ids: vis.IdType[]) {
    ids.forEach(id => {
      let index = this.IdToIndex(arrayToTrim, id)
      arrayToTrim.splice(index, 1);
    });
  }

  //TODO: Change datastructure if performance is bad
  private IdToIndex(array: vis.Node[]|vis.Edge[], id: vis.IdType) {
    return array.findIndex(element => element.id === id);
  }

  // Defines actions when user clicks on Nodes or Edges
  private onClick(params) {
    if (params.nodes && params.nodes.length >= 1) {
      if (this.isChangeNodeLabel) this.network.editNode();
    }
  }

  public debugPrint() {
    console.clear();
    console.log(JSON.stringify(this.nodes));
    console.log(JSON.stringify(this.edges));
  }

  // Boolean switch value if someone wants to change the nodeLabel name for button color
  public changeNodeName() {
    this.isChangeNodeLabel = !this.isChangeNodeLabel;
  }

  // initialize network properties
  private get graph(): HTMLElement {
    return this.graphRef.nativeElement;
  }

  // Start file download.
  exportGraph(){
    // Generate download of hello.json file with some content
    var text = "{\"nodes\":" + JSON.stringify(this.nodes) +",\"edges\":" + JSON.stringify(this.edges)+"}";
    var filename = "hello.json";
      
    this.importExportService.download(filename, text);
  }

  fileToUpload: File = null;

  importGraph(files: FileList){
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

      this.network.destroy();

      this.network = new Network( document.getElementById('networkContainer'), data, this.options)

      
      this.network.redraw();
    }, 1000);
  }
}



