import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { fromEvent, Subscription } from 'rxjs';
import { ImportExportService } from '../../importExport.service'
import { UndoRedoService } from 'src/app/undoRedo.service';
import { FlagService } from '../../flag.service'
import { strict as assert } from 'assert';
import { Tools, ChangingEdge, ChangingNode} from '../../Enums';
import { Network, Node, Edge, Data, Options, IdType, DataSetNodes, DataSetEdges } from "vis-network/peer/esm/vis-network";
import { DataSet } from "vis-data/peer/esm/vis-data"
import { emojis as flags } from '../../emojis'
import { RectOnDOM } from 'src/app/interfaces/RectOnDOM';
import domtoimage from 'dom-to-image';

@Component({
  selector: 'app-fairChain',
  templateUrl: './fairChain.component.html',
  styleUrls: ['./fairChain.component.scss'],
  providers: [ ImportExportService, UndoRedoService, FlagService ]
})

/**
 * This Component has many responsibilities. It takes all the user inputs and sends them to the services.
 * It saves the Network with all it's manipulations and data.
 * It enables and disables the edit modes, when it receives a new user input.
 */
export class FairChainComponent implements OnInit {

  public ngOnInit(): void {
    this.network = new Network(this.graph, this.data, this.options);
    this.makeSubscriptions();
  }

  constructor(private importExportService:ImportExportService, 
              private undoRedoService:UndoRedoService,
              private flagService:FlagService) {
    this.undoRedoService.addSnapshot(this.nodes, this.edges, this.metadata);
    this.emojis = flags;
  }

  /**
   * creates subscriptions which define what to do with which user input
   */
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
    this.subscriptions.add(
      fromEvent(this.network, 'doubleClick').subscribe(params => {
        this.onDoubleClick(params);
      })
    );
    this.subscriptions.add(
      fromEvent(this.network, 'dragging').subscribe(params => {
        if (this.isShowingRelabelPopUp) this.closeNodeRelabelPopUp();
      })
    );
  }

  public isRelabelPopUpVisible() : boolean {return this.isShowingRelabelPopUp;}
  public isAddingNode() : boolean {return this.currentTool === Tools.AddingNode;}
  public isAddingEdge() : boolean {return this.currentTool === Tools.AddingEdge;}
  public isChangingNodeLabel() : boolean {return this.changesNode === ChangingNode.NodeLabel;}
  public isChangingEdgeLabel() : boolean {return this.changesEdge === ChangingEdge.EdgeLabel;}
  public isChangingColor() : boolean {return this.changesNode === ChangingNode.NodeColor;}
  public isChangingFlag() : boolean {return this.changesNode === ChangingNode.NodeFlag;}
  public isDeletingFlag() : boolean {return this.changesNode === ChangingNode.DeleteNodeFlag;}
  public isInNodeEditMode() : boolean {return this.changesNode !== ChangingNode.None;}
  public isInEdgeEditMode() : boolean {return this.changesNode !== ChangingNode.None;}
  private stopEditMode() : void {this.changesNode = ChangingNode.None; this.changesEdge = ChangingEdge.None;}
  private makeToolIdle() : void {this.currentTool = Tools.Idle;}
  private closeNodeRelabelPopUp() : void {
    assert(this.isShowingRelabelPopUp, 'There is no pop up menu to close');
    assert(this.nodeToRelableId, 'There is no node to apply the change to'); 
    this.nodes.update({id: this.nodeToRelableId, label: this.flagService.addOrChangeFlag(this.nodeEdgeLabel, this.flagService.currentFlag)});
    this.isShowingRelabelPopUp = false;
    this.nodeToRelableId = '';
    this.makeSnapshot();
  }

  /**
   * A handy debug buttom for any
   */ 
  public isDebugging = true;
  public __debug__()
  {
    this.nodes.add({ id: 3, font: { face: 'Flags' }, label: '🇦🇱 \n Wood', x: 40, y: 40 })  
  }

  public nodeEdgeLabel = "";
  public nodeEdgeColor = "#002AFF";
  public nodeFlag = "🇨🇭";
  public emojis: string[];
  public nodeToRelableId: IdType;
  public isShowingRelabelPopUp = false;
  public isMetadataVisible = false;
  public relabelPopUpInfo: RectOnDOM;
  public metadata = "";

  @ViewChild('graph', {static: true}) graphRef: ElementRef;

  private network: Network;
  private subscriptions: Subscription;

  private changesNode: ChangingNode = ChangingNode.None;
  private changesEdge: ChangingEdge = ChangingEdge.None;
  private currentTool: Tools = Tools.Idle;

  // Create an set with our nodes
  private nodes: DataSetNodes = new DataSet();

  // Create an set with our edges
  private edges: DataSetEdges = new DataSet();

  // Create a data, which is defined by two arrays of nodes and edges
  private data: Data = {
    nodes: this.nodes,
    edges: this.edges,
  };

  /**
   * Initializes Node and Edge Properties
   *
   * @private initializes the different options available for nodes and edges.
   * The network physics sensibility is also set up in a way that looks more realistic
   * less sensible when nodes are moved.
   */
  private options: Options = {
    nodes: {
      shape: 'box',
      physics: true,
      font: { face: 'Flags', size: 30},
      labelHighlightBold: false
    },
    edges: {
      color: {
        inherit: false
      },
      font: { face: 'Flags', size: 20},
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
      // Responsible for the Edit Node with currently selected option
      editNode: (nodeData: Node, callback) => {
        assert(this.isInNodeEditMode(), 'The edge should not be edited when no option is selected');
        this.editNodeBasedOnCurrentNodeOption(nodeData);
        callback(nodeData);
        this.makeSnapshot();
      },
      // Responsible for the Edit Edge with currently selected option
      editEdge: (edgeData: Edge, callback) => {
        assert(this.isInEdgeEditMode(), 'The edge should not be edited when no option is selected');
        this.editEdgeBasedOnCurrentEdgeOption(edgeData);
        callback(edgeData);
        this.makeSnapshot();
      },
    },
    groups: {
      myGroup: {color:{background:'red'}, borderWidth:3}
    }
  };

  /**
   * Checks which boolean is true to call the right method and edit the node correctly.
   * 
   * @param nodeData is needed to know which node is being edited
   */
  private editNodeBasedOnCurrentNodeOption(nodeData: Node) {
    if (this.isChangingColor()) nodeData.color = this.nodeEdgeColor;
    if (this.isDeletingFlag()) nodeData.label = this.flagService.removeFlagFromLabel(nodeData.label);
    if (this.isChangingFlag()) nodeData.label = this.flagService.addOrChangeFlag(nodeData.label, this.nodeFlag);
    if (this.isChangingNodeLabel()) {
      this.flagService.saveFlagFromLabel(nodeData.label);
      this.nodeEdgeLabel = this.flagService.removeFlagFromLabel(this.nodeEdgeLabel);
      nodeData.label = this.flagService.addOrChangeFlag(this.nodeEdgeLabel, this.flagService.currentFlag);
    };
  }

  /**
   * Checks which boolean is true to call the right method and edit the edge correctly.
   * 
   * @param edgeData is needed to know which edge is being edited
   */
  private editEdgeBasedOnCurrentEdgeOption(edgeData: Edge) {
    if (this.isChangingEdgeLabel()) edgeData.label = this.nodeEdgeLabel;
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
   * Defines dynamic actions when clicking on certain objects in the network
   *
   * @param params needed to distinguish the different clicked elements from each other (node or edge)
   */
  private onClick(params) {
    if (this.isShowingRelabelPopUp) this.closeNodeRelabelPopUp();
    // Defines node onClick actions
    if (this.isClickingOnNodeInNodeEditMode(params)) this.network.editNode();
    // Defines edge onClick actions
    if (this.isClickingOnEdgeInEdgeEditMode(params) && params.nodes.length == 0) this.editEdgeInDataset(params.edges);
  }

  /**
   * Updates the edited edges in the dataset and then ends the editmode.
   * 
   * @param edges all the edges with the done changes.
   */
  private editEdgeInDataset(edges: IdType[]) {
    edges.forEach((id) => {
      let edgeData: Edge = this.edges.get(id);
      this.editEdgeBasedOnCurrentEdgeOption(edgeData);
      this.edges.update(edgeData);
    });
    this.network.disableEditMode();
    this.makeSnapshot()
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

  /**
   * Defines dynamic actions when stop draging certain objects in the network
   *
   * @param params needed to distinguish the different dragged node
   */
  private onDragEnd(params) {
    if (params.nodes && params.nodes.length >= 1) {
      this.makeSnapshot();
    }
  }

  /**
   * Defines dynamic actions when doubleclicking on certain objects in the network
   *
   * @param params needed to distinguish the different doubleclicked elements from each other (node or edge)
   */
  private onDoubleClick(pointer) {
    this.network.disableEditMode();
    if (pointer.nodes.length === 1) this.showRelabelPopUp(pointer);
  }

  // Boolean switch value if someone wants to change the node label
  public changeNodeName() {
    this.makeToolIdle();
    if (this.isChangingNodeLabel()) this.changesNode = ChangingNode.None;
    else this.changesNode = ChangingNode.NodeLabel;
  };

  // Boolean switch value if someone wants to change the edge label
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
    var text = this.importExportService.convertNetworkToJSON(this.nodes, this.edges, this.metadata);
    var filename = "Graph.json";
    this.importExportService.download(filename, text);
  }

  /**
   * Sends the received file to a method in importExport.service where the data gets parsed from the file.
   * Remakes the subscriptions and a snapshot to be fully functional again.
   *
   * @param files is the file selected to import.
   */
  public async importGraph(files: FileList) {
    this.updateData( await this.importExportService.upload(files.item(0)));
    this.makeSubscriptions();
    this.makeSnapshot();
  }

  public updateData(data){
    this.nodes = new DataSet();
    this.nodes.add(data.nodes);

    this.edges = new DataSet();
    this.edges.add(data.edges);

    this.metadata = data.metadata;

    this.data = {nodes: this.nodes, edges: this.edges};
    this.network = new Network(this.graph, this.data, this.options);
    this.makeSubscriptions();
  }

  /**
   * Responsible to switch the node color functionality
   * on or off if the button is pressed.
   */
  public changeNodeColor(){
    this.network.disableEditMode();
    this.makeToolIdle();
    if (this.isChangingColor()) this.changesNode = ChangingNode.None;
    else this.changesNode = ChangingNode.NodeColor;
  }

  /**
   * Responsible to switch the edge color functionality
   * on or off if the button is pressed.
   */
  public changeEdgeColor(){
    this.network.disableEditMode();
    this.makeToolIdle();
    if (this.isChangingColor()) this.changesEdge = ChangingEdge.None;
    else this.changesEdge = ChangingEdge.EdgeColor;
  }

  /**
   * Responsible to switch the change flag of a node functionality
   * on or off if the button is pressed.
   */
  public changeFlag(){
    this.network.disableEditMode();
    this.makeToolIdle();
    if (this.isChangingFlag()) this.changesNode = ChangingNode.None;
    else this.changesNode = ChangingNode.NodeFlag;
  }

  /**
   * Responsible to switch the delete flag of a node functionality
   * on or off if the button is pressed.
   */
  public deleteFlag(){
    this.network.disableEditMode();
    this.makeToolIdle();
    if (this.isDeletingFlag()) this.changesNode = ChangingNode.None;
    else this.changesNode = ChangingNode.DeleteNodeFlag;
  }

  private makeSnapshot(){
    this.undoRedoService.addSnapshot(this.nodes, this.edges, this.metadata);
  }

  public undo(){
    this.updateData(this.undoRedoService.getPredecessorSnapshot())
  }

  public redo(){
    this.updateData(this.undoRedoService.getSuccessorSnapshot())
  }

  private showRelabelPopUp(pointer) {
    this.nodeToRelableId = pointer.nodes[0];
    let relabelRectOnDOM = this.getBoundingBoxOfNodeAsRectInDOM();
    this.relabelPopUpInfo = this.cropAndTranslateRect(relabelRectOnDOM);
    this.nodeEdgeLabel = this.flagService.removeFlagFromLabel(this.nodes.get(this.nodeToRelableId).label);
    this.flagService.saveFlagFromLabel(this.nodes.get(this.nodeToRelableId).label);

    this.isShowingRelabelPopUp  = true;
  }

  private cropAndTranslateRect(rect: RectOnDOM): RectOnDOM {
    const min_x = this.graph.getBoundingClientRect().left;
    const min_y = this.graph.getBoundingClientRect().top;
    const max_x = this.graph.getBoundingClientRect().right;
    const max_y = this.graph.getBoundingClientRect().bottom;

    rect = this.moveRectOverNode(rect, min_x, min_y);
    rect = this.cropRectToFitCanvas(rect, min_x, min_y, max_x, max_y)
    rect = this.moveRectLeftToFitCanvas(rect, min_x);
    rect = this.moveRectRightToFitCanvas(rect, max_x);
    rect = this.moveRectDownToFitCanvas(rect, min_y);
    rect = this.moveRectUpToFitCanvas(rect, max_y);

    return rect;
  }

  moveRectUpToFitCanvas(rect: RectOnDOM, max_y: number): RectOnDOM {
    if (rect.y + rect.height > max_y) rect.y = max_y - rect.height;
    return rect;
  }

  moveRectDownToFitCanvas(rect: RectOnDOM, min_y: number): RectOnDOM {
    if (rect.y < min_y) rect.y = min_y;
    return rect;
  }

  moveRectRightToFitCanvas(rect: RectOnDOM, max_x: number): RectOnDOM {
    if (rect.x + rect.width > max_x) rect.x = max_x - rect.width;
    return rect;
  }

  moveRectLeftToFitCanvas(rect: RectOnDOM, min_x: number): RectOnDOM {
    if (rect.x < min_x) rect.x = min_x;
    return rect;
  }

  private cropRectToFitCanvas(rect: RectOnDOM, min_x: number, min_y: number, max_x: number, max_y: number): RectOnDOM {
    if (rect.width > max_x - min_x) rect.width = max_x - min_x;
    if (rect.height > max_y - min_y) rect.height = max_y - min_y;
    return rect;
  }

  private moveRectOverNode(rect: RectOnDOM, min_x: number, min_y: number): RectOnDOM {
    rect.x += min_x;
    rect.y += min_y;
    return rect;
  }

  private getBoundingBoxOfNodeAsRectInDOM() : RectOnDOM {
    const boundingBox = this.network.getBoundingBox(this.nodeToRelableId);
    const upperLeftCorner = this.network.canvasToDOM({x: boundingBox.left, y: boundingBox.top});
    const bottomRightCorner = this.network.canvasToDOM({x: boundingBox.right, y: boundingBox.bottom});
    return {
      x: upperLeftCorner.x,
      y: upperLeftCorner.y,
      width: bottomRightCorner.x - upperLeftCorner.x,
      height: bottomRightCorner.y - upperLeftCorner.y};
  }

  /**
   * Converts the HTML class networkContainer to a jpeg and
   * downloads it as Fairchain.jpeg
   */
  downloadGraphAsJpeg(){
    domtoimage.toJpeg(document.getElementById("networkContainer"))
    .then(function (dataUrl) {
        var link = document.createElement('a');
        link.download = 'Fairchain.jpeg';
        link.href = dataUrl;
        link.click();
    });

  }

  public getChangesNode(){return this.changesNode}
  public getChangesEdge(){return this.changesEdge}
  public getCurrentTool(){return this.currentTool}
  public getNetwork(){return this.network}
}
