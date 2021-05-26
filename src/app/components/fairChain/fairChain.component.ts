import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {fromEvent, Subscription} from 'rxjs';
import {ImportExportService} from '../../importExport.service';
import {UndoRedoService} from 'src/app/undoRedo.service';
import {strict as assert} from 'assert';
import {Tools, ChangingEdge, ChangingNode} from '../../Enums';
import {Network, Node, Edge, Data, Options, IdType, DataSetNodes, DataSetEdges} from 'vis-network/peer/esm/vis-network';
import {DataSet} from 'vis-data/peer/esm/vis-data';
import {group, GroupsService} from 'src/app/groups.service';
import {RectOnDOM} from 'src/app/interfaces/RectOnDOM';
import {CustomSnackbarService} from 'src/app/custom-snackbar.service';

@Component({
  selector: 'app-fairChain',
  templateUrl: './fairChain.component.html',
  styleUrls: ['./fairChain.component.scss'],
  providers: [ImportExportService, UndoRedoService]
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

  constructor(private importExportService: ImportExportService, private undoRedoService: UndoRedoService, private groupsServices: GroupsService, private snackBar: CustomSnackbarService) {
    this.undoRedoService.addSnapshot(this.nodes, this.edges);
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
    this.subscriptions.add(
      fromEvent(this.network, 'doubleClick').subscribe(params => {
        this.onDoubleClick(params);
      })
    );
    this.subscriptions.add(
      fromEvent(this.network, 'dragging').subscribe(params => {
        if (this.isShowingRelabelPopUp) {
          this.closeNodeRelabelPopUp();
        }
      })
    );
  }

  public isRelabelPopUpVisible(): boolean {
    return this.isShowingRelabelPopUp;
  }

  public isAddingNode(): boolean {
    return this.currentTool === Tools.AddingNode;
  }

  public isAddingEdge(): boolean {
    return this.currentTool === Tools.AddingEdge;
  }

  public isChangingNodeLabel(): boolean {
    return this.changesNode === ChangingNode.NodeLabel;
  }

  public isChangingEdgeLabel(): boolean {
    return this.changesEdge === ChangingEdge.EdgeLabel;
  }

  public isInNodeEditMode(): boolean {
    return this.changesNode !== ChangingNode.None;
  }

  public isInEdgeEditMode(): boolean {
    return this.changesNode !== ChangingNode.None;
  }

  private stopEditMode(): void {
    this.changesNode = ChangingNode.None;
    this.changesEdge = ChangingEdge.None;
  }

  private makeToolIdle(): void {
    this.currentTool = Tools.Idle;
  }

  public isChangingGroup(): boolean {
    return this.changesNode === ChangingNode.NodeGroup;
  }

  // A handy debug buttom for any
  nameOfNewGroup: string = '';
  listOfGroups = ['none', 'ethical', 'unethical', 'sustainable', 'unsustainable'];

  change(value: string) {
    this.selectedGroup = value;
  }

  private closeNodeRelabelPopUp(): void {
    assert(this.isShowingRelabelPopUp, 'There is no pop up menu to close');
    assert(this.nodeToRelableId, 'There is no node to apply the change to');
    this.nodes.update({id: this.nodeToRelableId, label: this.nodeEdgeLabel});
    this.isShowingRelabelPopUp = false;
    this.nodeToRelableId = '';
    this.makeSnapshot();
  }

  // A handy debug buttom for any
  public isDebugging = true;

  public __debug__() {
    assert(this.isDebugging, 'Function should not be called unless in debug mode');
    console.log(this.nameOfNewGroup);
  }

  public nodeEdgeLabel = '';
  public nodeEdgeColor = '#002AFF';
  public nodeGroupColor = '#002AFF';
  public selectedGroup = 'none';
  public nodeToRelableId: IdType;
  public isShowingRelabelPopUp = false;
  public relabelPopUpInfo: RectOnDOM;

  @ViewChild('graph', {static: true}) graphRef: ElementRef;
  //@ViewChild('nodeRelabelPopUp', {static: true}) nodeRelabelPopUpRef: ElementRef;
  //@ViewChild('nodeRelabelPopUpContainer', {static: true}) nodeRelabelPopUpContainerRef: ElementRef;

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

  private nodeGroups = {
    group1: {
      color: 'blue'
    },
    group2: {
      color: 'orange'
    },
    group3: {
      color: 'green'
    },
    group4: {
      color: 'red'
    }
  };
  // Create a network
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
    groups: this.nodeGroups,

    manipulation: {
      // Defines logic for Add Node functionality
      addNode: (data: Node, callback) => {
        if (this.isAddingNode()) {
          assert(this.isAddingNode(), 'The current tool should be adding a node');
          callback(data);
          this.network.addNodeMode();
          this.makeSnapshot();
        }
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
        nodeData.label = this.nodeEdgeLabel;
        callback(nodeData);
        this.makeSnapshot();
      },
      editEdge: (edgeData: Edge, callback) => {
        assert(this.isInEdgeEditMode(), 'The edge should not be edited when no option is selected');
        this.editEdgeBasedOnCurrentEdgeOption(edgeData);
        callback(edgeData);
        this.makeSnapshot();
      },
    },
  };

  private editNodeBasedOnCurrentNodeOption(nodeData: Node) {
    if (this.isChangingNodeLabel()) {
      nodeData.label = this.nodeEdgeLabel;
    }
    if (this.changesNode === ChangingNode.NodeGroup) {
      this.updateNodeGroup(nodeData);
    }
  }

  private editEdgeBasedOnCurrentEdgeOption(edgeData: Edge) {
    if (this.isChangingEdgeLabel()) {
      edgeData.label = this.nodeEdgeLabel;
    }
  }

  private applyLabelInRelabelPopUpToSelectedNode() {
    this.network.unselectAll();
    this.network.selectNodes([this.nodeToRelableId]);
    this.network.editNode();
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
    if (this.isShowingRelabelPopUp) {
      this.closeNodeRelabelPopUp();
    }
    // Defines node onClick actions
    if (this.isClickingOnNodeInNodeEditMode(params)) {
      this.editNodeInDataset(params.nodes);
    }
    // Defines edge onClick actions
    //TODO: With new edge dataset, define custom events for changing labels/color
    if (this.isClickingOnEdgeInEdgeEditMode(params) && params.nodes.length == 0) {
      this.editEdgeInDataset(params.edges);
    }
  }

  private editEdgeInDataset(edges: IdType[]) {
    edges.forEach((id) => {
      let edgeData: Edge = this.edges.get(id);
      this.editEdgeBasedOnCurrentEdgeOption(edgeData);
      this.edges.update(edgeData);
    });
    this.network.disableEditMode();
    this.makeSnapshot();
  }

  private editNodeInDataset(nodes: IdType[]) {
    nodes.forEach((id) => {
      let nodeData: Node = this.nodes.get(id);
      this.editNodeBasedOnCurrentNodeOption(nodeData);
      this.nodes.update(nodeData);
    });
    this.network.disableEditMode();
    this.makeSnapshot();
  }

  private isClickingOnNodeInNodeEditMode(params): boolean {
    return params.nodes
      && params.nodes.length >= 1
      && this.isInNodeEditMode();
  }

  private isClickingOnEdgeInEdgeEditMode(params): boolean {
    return params.edges
      && params.edges.length >= 1
      && this.isInEdgeEditMode();
  }

  private onDragEnd(params) {
    if (params.nodes && params.nodes.length >= 1) {
      this.makeSnapshot();
    }
  }

  private onDoubleClick(pointer) {
    this.network.disableEditMode();
    if (pointer.nodes.length === 1) {
      this.showRelabelPopUp(pointer);
    }
  }

  // Boolean switch value if someone wants to change the nodeLabel name for button color
  public changeNodeName() {
    this.makeToolIdle();
    if (this.isChangingNodeLabel()) {
      this.changesNode = ChangingNode.None;
    } else {
      this.changesNode = ChangingNode.NodeLabel;
    }
  };

  public changeEdgeName() {
    this.makeToolIdle();
    if (this.isChangingEdgeLabel()) {
      this.changesEdge = ChangingEdge.None;
    } else {
      this.changesEdge = ChangingEdge.EdgeLabel;
    }
  };

  // Initialize network properties
  private get graph(): HTMLElement {
    return this.graphRef.nativeElement;
  }

  /*
  // Initialize popup properties
  private get nodeRelabelPopUp(): HTMLElement {
    return this.nodeRelabelPopUpRef.nativeElement;
  }

  // Initialize popup properties
  private get nodeRelabelPopUpContainer(): HTMLElement {
    return this.nodeRelabelPopUpContainerRef.nativeElement;
  }
  */

  /**
   * Puts current nodes and edges variables into json syntax and stores it in a string.
   * Downloads the file as Graph.json with the method in importExport.service.
   */
  public exportGraph() {
    var text = this.importExportService.convertNetworkToJSON(this.nodes, this.edges);
    var filename = 'Graph.json';
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
    this.updateData(await this.importExportService.upload(files.item(0)));
    this.makeSubscriptions();
    this.makeSnapshot();
  }

  public updateData(data) {
    this.nodes = new DataSet();
    this.nodes.add(data.nodes);

    this.edges = new DataSet();
    this.edges.add(data.edges);

    this.data = {nodes: this.nodes, edges: this.edges};
    this.network = new Network(this.graph, this.data, this.options);
    this.makeSubscriptions();
  }

  private makeSnapshot() {
    this.undoRedoService.addSnapshot(this.nodes, this.edges);
  }

  public undo() {
    this.updateData(this.undoRedoService.getPredecessorSnapshot());
  }

  public redo() {
    this.updateData(this.undoRedoService.getSuccessorSnapshot());
  }

  public changeNodeGroup() {
    this.makeToolIdle();
    if (this.isChangingGroup()) {
      this.changesNode = ChangingNode.None;
      this.network.disableEditMode();
    } else {
      this.changesNode = ChangingNode.NodeGroup;
    }
  }

  public updateNodeGroup(node: Node) {
    node.group = this.groupsServices.findVisJsName(this.selectedGroup);
    if (this.groupsServices.findVisJsName(this.selectedGroup) != 'none') {
      eval('node.color = this.options.groups.' + this.groupsServices.findVisJsName(this.selectedGroup) + '.color');
    }
  }

  // ToDo: comment
  public addGroup() {

    if (this.groupsServices.checkGroupName(this.nameOfNewGroup)) {
      this.snackBar.open('Group name already exists');
    } else {
      this.groupsServices.addGroup(this.nameOfNewGroup, this.nodeGroupColor);
      var temp = this.groupsServices.getGroups();
      this.options.groups = temp;
      this.network.setOptions(this.options);
      this.listOfGroups = this.groupsServices.getGroupsName();
    }
  }
  // ToDo: comment
  public changeNodeGroupColor() {
    var selectedGroup = this.groupsServices.findVisJsName(this.selectedGroup);
    var loopActivated = false;
    eval('this.options.groups.' + selectedGroup + '.color = ' + '\'' + this.nodeGroupColor + '\'');

    this.network.setOptions(this.options);

    this.nodes.forEach(node => {
      if (node.group == selectedGroup) {
        loopActivated = true;
        node.color = this.nodeGroupColor;
        this.network.updateClusteredNode(node.id, {group: selectedGroup});
      }
    });
    if (loopActivated) {
      this.makeSnapshot();
    }
    this.network.disableEditMode();
  }

  private showRelabelPopUp(pointer) {
    this.nodeToRelableId = pointer.nodes[0];
    let relabelRectOnDOM = this.getBoundingBoxOfNodeAsRectInDOM();
    this.relabelPopUpInfo = this.cropAndTranslateRect(relabelRectOnDOM);
    this.nodeEdgeLabel = this.nodes.get(this.nodeToRelableId).label;

    this.isShowingRelabelPopUp = true;
  }

  private cropAndTranslateRect(rect: RectOnDOM): RectOnDOM {
    const min_x = this.graph.getBoundingClientRect().left;
    const min_y = this.graph.getBoundingClientRect().top;
    const max_x = this.graph.getBoundingClientRect().right;
    const max_y = this.graph.getBoundingClientRect().bottom;

    rect = this.moveRectOverNode(rect, min_x, min_y);
    rect = this.cropRectToFitCanvas(rect, min_x, min_y, max_x, max_y);
    rect = this.moveRectLeftToFitCanvas(rect, min_x);
    rect = this.moveRectRightToFitCanvas(rect, max_x);
    rect = this.moveRectDownToFitCanvas(rect, min_y);
    rect = this.moveRectUpToFitCanvas(rect, max_y);

    return rect;
  }

  moveRectUpToFitCanvas(rect: RectOnDOM, max_y: number): RectOnDOM {
    if (rect.y + rect.height > max_y) {
      rect.y = max_y - rect.height;
    }
    return rect;
  }

  moveRectDownToFitCanvas(rect: RectOnDOM, min_y: number): RectOnDOM {
    if (rect.y < min_y) {
      rect.y = min_y;
    }
    return rect;
  }

  moveRectRightToFitCanvas(rect: RectOnDOM, max_x: number): RectOnDOM {
    if (rect.x + rect.width > max_x) {
      rect.x = max_x - rect.width;
    }
    return rect;
  }

  moveRectLeftToFitCanvas(rect: RectOnDOM, min_x: number): RectOnDOM {
    if (rect.x < min_x) {
      rect.x = min_x;
    }
    return rect;
  }

  private cropRectToFitCanvas(rect: RectOnDOM, min_x: number, min_y: number, max_x: number, max_y: number): RectOnDOM {
    if (rect.width > max_x - min_x) {
      rect.width = max_x - min_x;
    }
    if (rect.height > max_y - min_y) {
      rect.height = max_y - min_y;
    }
    return rect;
  }

  private moveRectOverNode(rect: RectOnDOM, min_x: number, min_y: number): RectOnDOM {
    rect.x += min_x;
    rect.y += min_y;
    return rect;
  }

  private getBoundingBoxOfNodeAsRectInDOM(): RectOnDOM {
    const boundingBox = this.network.getBoundingBox(this.nodeToRelableId);
    const upperLeftCorner = this.network.canvasToDOM({x: boundingBox.left, y: boundingBox.top});
    const bottomRightCorner = this.network.canvasToDOM({x: boundingBox.right, y: boundingBox.bottom});
    return {
      x: upperLeftCorner.x,
      y: upperLeftCorner.y,
      width: bottomRightCorner.x - upperLeftCorner.x,
      height: bottomRightCorner.y - upperLeftCorner.y
    };
  }

  public getChangesNode() {
    return this.changesNode;
  }

  public getChangesEdge() {
    return this.changesEdge;
  }

  public getCurrentTool() {
    return this.currentTool;
  }

  public getNetwork() {
    return this.network;
  }
}

