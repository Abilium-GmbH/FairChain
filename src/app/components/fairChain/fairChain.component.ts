import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {fromEvent, Subscription} from 'rxjs';
import {ImportExportService} from '../../importExport.service';
import {UndoRedoService} from 'src/app/undoRedo.service';
import {PopUpGeometryService} from 'src/app/pop-up-geometry-service.service';
import {FlagService} from '../../flag.service';
import {Tools, ChangingEdge, ChangingNode} from '../../Enums';
import {Network, Node, Edge, Data, Options, IdType, DataSetNodes, DataSetEdges, Position} from 'vis-network/peer/esm/vis-network';
import {DataSet} from 'vis-data/peer/esm/vis-data';
import {GroupsService} from 'src/app/groups.service';
import {CustomSnackbarService} from 'src/app/custom-snackbar.service';
import {emojis as flags, radioEmojis as radioFlags} from '../../emojis';
import {RectOnDOM} from 'src/app/interfaces/RectOnDOM';
import {NodeRelabelInfo} from '../../interfaces/NodeRelabelInfo';
import {EdgeRelabelInfo} from 'src/app/interfaces/EdgeRelabelInfo';
import {HoverOptionInfo} from 'src/app/interfaces/HoverOptionInfo';
import {toPng} from 'html-to-image';
import {MatSnackBar} from '@angular/material/snack-bar';
import {HoverOptionOnDOM} from './../../interfaces/HoverOptionOnDOM';
import {GroupInfo} from 'src/app/interfaces/GroupInfo';

/**
 * This Component has many responsibilities. It takes all the user inputs and sends them to the services.
 * It saves the Network with all it's manipulations and data.
 * It enables and disables the edit modes, when it receives a new user input.
 */
@Component({
  selector: 'app-fairChain',
  templateUrl: './fairChain.component.html',
  styleUrls: ['./fairChain.component.scss'],
  providers: [ImportExportService, UndoRedoService, FlagService]
})
export class FairChainComponent implements OnInit {

  constructor(private importExportService: ImportExportService,
              private undoRedoService: UndoRedoService,
              private flagService: FlagService,
              private groupsServices: GroupsService,
              private snackBar: CustomSnackbarService,
              private popUpGeometryService: PopUpGeometryService,
              private matSnackBar: MatSnackBar) {
    this.undoRedoService.addSnapshot(this.nodes, this.edges, this.metadata, this.groupsServices.getRawGroups());
    this.emojis = flags;
    this.radioEmojis = radioFlags;
  }

  // Initialize network properties
  private get graph(): HTMLElement {
    return this.graphRef.nativeElement;
  }

  public nodeEdgeLabel = '';
  public nodeEdgeColor = '#002AFF';
  public nodeToRelabelId: IdType;
  public isShowingRelabelPopUp = false;
  public metadata = '';
  public isMetadataVisible = false;

  private nodeRelabelPopUpInfo: NodeRelabelInfo = {
    nodeId: '',
    active: false,
    label: '',
    rect: undefined
  };

  private edgeRelabelPopUpInfo: EdgeRelabelInfo = {
    active: false,
    label: '',
    edgeId: '',
    rect: undefined
  };

  private hoverOptionAddChildInfo: HoverOptionInfo = {
    active: false,
    nodeId: '',
    addChildNodeInfo: undefined,
    boundingBox: undefined
  };

  public groupInfo: GroupInfo = {
    name: '',
    groups: ['none', 'ethical', 'unethical', 'sustainable', 'unsustainable'],
    colour: '#002AFF',
    selected: 'none'
  };

  public edgeToRelabelId: IdType;
  public isShowingEdgeRelabelPopUp = false;

  public nodeFlag = 'CH 🇨🇭';

  public emojis: string[];
  public radioEmojis: string[];

  @ViewChild('graph', {static: true}) graphRef: ElementRef;

  private network: Network;
  private subscriptions: Subscription;

  private changesNode: ChangingNode = ChangingNode.None;
  private changesEdge: ChangingEdge = ChangingEdge.None;
  private currentTool: Tools = Tools.Idle;

  private defaultGroupColor = '#73c2fb';


  // Create an array with nodes
  private nodes: DataSetNodes = new DataSet();

  // Create an array with edges
  private edges: DataSetEdges = new DataSet();

  // Create a network
  private data: Data = {
    nodes: this.nodes,
    edges: this.edges,
  };

  /**
   * A handy debug button for any
   */
  public isDebugging = true;

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
      font: {face: 'Flags', size: 30},
      labelHighlightBold: false,
      margin: {
        top: 10,
        bottom: 10,
        left: 10,
        right: 10
      }
    },
    edges: {
      color: {
        inherit: false
      },
      font: {face: 'Flags', size: 20},
      smooth: false,
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
    interaction: {
      hover: true
    },
    manipulation: {
      // Defines logic for Add Node functionality
      addNode: (data: Node, callback) => {
        if (this.isAddingNode()) {
          console.assert(this.isAddingNode(), 'The current tool should be adding a node');
          data.label = 'double click\nto change';
          data.color = this.defaultGroupColor;
          callback(data);
          this.network.addNodeMode();
          this.makeSnapshot();
        }
      },
      // Defines logic for Add Edge functionality
      addEdge: (data: Edge, callback) => {
        console.assert(this.isAddingEdge(), 'The current tool should be adding an edge');
        if (this.edges.length <= 0) {
          data.label = 'double click\nto change';
        }
        callback(data);
        this.network.addEdgeMode();
        this.makeSnapshot();
      },
      // Responsible for the Edit Node with currently selected option
      editNode: (nodeData: Node, callback) => {
        console.assert(this.isInNodeEditMode(), 'The node should not be edited when no option is selected');
        this.editNodeBasedOnCurrentNodeOption(nodeData);
        callback(nodeData);
        this.makeSnapshot();
      },
      // Responsible for the Edit Edge with currently selected option
      editEdge: (edgeData: Edge, callback) => {
        console.assert(this.isInEdgeEditMode(), 'The edge should not be edited when no option is selected');
        this.editEdgeBasedOnCurrentEdgeOption(edgeData);
        callback(edgeData);
        this.makeSnapshot();
      },
    }
  };

  applyGroupColor(value: string) {
    this.groupInfo.selected = value;
    this.groupInfo.colour = this.getGroupColorToApply();
  }

  public ngOnInit(): void {
    this.options.groups = this.groupsServices.getGroups(this.defaultGroupColor);
    this.network = new Network(this.graph, this.data, this.options);
    this.makeSubscriptions();
    this.openSnackBar();
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
        if (this.isNodeRelabelPopUpVisible()) {
          this.closeNodeRelabelPopUp();
        }
        if (this.isEdgeRelabelPopUpVisible()) {
          this.closeEdgeRelabelPopUp();
        }
        if (this.isHoverOptionAddNodeVisible()) {
          this.stopShowingNodeHoverOption();
        }
      })
    );
    this.subscriptions.add(
      fromEvent(this.network, 'hoverNode').subscribe(params => {
        this.onHoverNode(params);
      })
    );
    this.subscriptions.add(
      fromEvent(this.network, 'blurNode').subscribe(params => {
        if (this.isAddingNode()) {
          this.enableAddNodeMode();
        }
      })
    );
    this.subscriptions.add(
      fromEvent(this.network, 'blurEdge').subscribe(params => {
        if (this.isAddingEdge()) {
          this.enableAddEdgeMode();
        }
      })
    );
    this.subscriptions.add(
      fromEvent(this.network, 'zoom').subscribe(params => {
        if (this.nodeRelabelPopUpInfo.active) {
          this.closeNodeRelabelPopUp();
        }
        if (this.edgeRelabelPopUpInfo.active) {
          this.closeEdgeRelabelPopUp();
        }
        if (this.isAddingEdge()) {
          this.enableAddEdgeMode();
        }
        if (this.isAddingNode()) {
          this.enableAddNodeMode();
        }
        if (this.network.getScale() <= 0.5) {
          this.network.moveTo({position: {x: 0, y: 0}, scale: 0.5});
        }
        if (this.network.getScale() > 3) {
          this.network.moveTo({scale: 3});
        }
      })
    );
  }

  private onHoverNode(params): void {
    if (this.isAddingNode()) {
      this.stopAddMode();
    }
    if (!this.isHoverOptionAddNodeVisible()) {
      this.showAddChildNodeOptions(params.node);
    }
  }

  public isChangingGroup(): boolean {
    return this.changesNode === ChangingNode.NodeGroup;
  }

  public isHoverOptionAddNodeVisible(): boolean {
    return this.hoverOptionAddChildInfo.active;
  }

  public isNodeRelabelPopUpVisible(): boolean {
    return this.nodeRelabelPopUpInfo.active;
  }

  public isEdgeRelabelPopUpVisible(): boolean {
    return this.edgeRelabelPopUpInfo.active;
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

  public isChangingColor(): boolean {
    return this.changesNode === ChangingNode.NodeColor;
  }

  public isChangingFlag(): boolean {
    return this.changesNode === ChangingNode.NodeFlag;
  }

  public isDeletingFlag(): boolean {
    return this.changesNode === ChangingNode.DeleteNodeFlag;
  }

  public isInNodeEditMode(): boolean {
    return this.changesNode !== ChangingNode.None;
  }

  public isInEdgeEditMode(): boolean {
    return this.changesNode !== ChangingNode.None;
  }

  private stopAddMode(): void {
    this.network.disableEditMode();
  }

  private enableAddNodeMode(): void {
    this.network.addNodeMode();
  }

  private enableAddEdgeMode(): void {
    this.network.addEdgeMode();
  }

  private stopEditMode(): void {
    this.changesNode = ChangingNode.None;
    this.changesEdge = ChangingEdge.None;
  }

  private makeToolIdle(): void {
    this.currentTool = Tools.Idle;
  }

  private closeNodeRelabelPopUp(): void {
    console.assert(this.nodeRelabelPopUpInfo.active, 'There is no pop up menu to close');
    console.assert(this.nodeRelabelPopUpInfo.nodeId !== '', 'There is no node to apply the change to');
    this.nodes.update({
      id: this.nodeRelabelPopUpInfo.nodeId,
      label: this.flagService.addOrChangeFlag(this.nodeRelabelPopUpInfo.label, this.flagService.currentFlag)
    });
    this.nodeRelabelPopUpInfo.active = false;
    this.nodeRelabelPopUpInfo.nodeId = '';
    this.makeSnapshot();
  }

  private closeEdgeRelabelPopUp(): void {
    console.assert(this.edgeRelabelPopUpInfo.active, 'There is no pop up menu to close');
    console.assert(this.edgeRelabelPopUpInfo.edgeId !== '', 'There is no edge to apply the change to');
    // Will not update edge on empty string
    this.edges.update({id: this.edgeRelabelPopUpInfo.edgeId, label: this.edgeRelabelPopUpInfo.label + ' '});
    this.edgeRelabelPopUpInfo.active = false;
    this.edgeRelabelPopUpInfo.edgeId = undefined;
    this.makeSnapshot();
  }

  public addChildNodeToHoveredNode() {
    const newNodeId = this.makeNewId();
    const newEdgeId = this.makeNewId();
    const node: Node = this.nodes.get(this.hoverOptionAddChildInfo.nodeId);
    node.x += 400;
    node.color = this.defaultGroupColor;
    this.nodes.add({id: newNodeId, label: 'double click\nto change', x: node.x, y: node.y});
    const edgeLabel = (this.edges.length <= 0) ? 'double click\nto change' : '';
    this.edges.add({id: newEdgeId, to: this.hoverOptionAddChildInfo.nodeId, from: newNodeId, label: edgeLabel});
    this.makeSnapshot();
  }

  private makeNewId() {
    return this.genHexString(8) + '-' +
      this.genHexString(4) + '-' +
      this.genHexString(4) + '-' +
      this.genHexString(4) + '-' +
      this.genHexString(12);
  }

  private genHexString(len) {
    const hex = '0123456789abcdef';
    let output = '';
    for (let i = 0; i < len; ++i) {
      output += hex.charAt(Math.floor(Math.random() * hex.length));
    }
    return output;
  }

  public __debug__() {
    this.nodes.add({id: 3, font: {face: 'Flags'}, label: '🇦🇱 \n Wood', x: 40, y: 40});
  }

  /**
   * Checks which boolean is true to call the right method and edit the edge correctly.
   *
   * @param edgeData is needed to know which edge is being edited
   */
  private editEdgeBasedOnCurrentEdgeOption(edgeData: Edge): void {
    if (this.isChangingEdgeLabel()) {
      edgeData.label = this.nodeEdgeLabel;
    }
  }

  /**
   * Responsible to switch the addEdge button color and addEdge functionality
   * on or off if the button is pressed
   */
  public addEdgeInNetwork(): void {
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
   * Implements the add group functionality
   */
  public addGroup(): void {
    if (this.groupsServices.doesGroupExist(this.groupInfo.name)) {
      this.snackBar.open('Group name already exists');
    } else {
      this.groupsServices.addGroup(this.groupInfo.name, this.groupInfo.colour);
      const temp = this.groupsServices.getGroups(this.defaultGroupColor);
      this.options.groups = temp;
      this.network.setOptions(this.options);
      this.groupInfo.groups = this.groupsServices.getGroupsName();
      this.makeSnapshot();
    }
  }

  /**
   * Responsible to switch the addNode button color and addNode functionality
   * on or off if the button is pressed
   */
  public addNodeInNetwork(): void {
    this.stopEditMode();
    if (this.isAddingNode()) {
      this.currentTool = Tools.Idle;
      this.network.disableEditMode();
    } else {
      this.currentTool = Tools.AddingNode;
      this.network.addNodeMode();
    }
  }

  // Boolean switch value if someone wants to change the edge label
  public changeEdgeName(): void {
    this.makeToolIdle();
    if (this.isChangingEdgeLabel()) {
      this.changesEdge = ChangingEdge.None;
    } else {
      this.changesEdge = ChangingEdge.EdgeLabel;
    }
  }

  /**
   * Responsible to switch the change flag of a node functionality
   * on or off if the button is pressed.
   */
  public changeFlag(): void {
    this.network.disableEditMode();
    this.makeToolIdle();
    if (this.isChangingFlag()) {
      this.changesNode = ChangingNode.None;
    } else {
      this.changesNode = ChangingNode.NodeFlag;
    }
  }

  public changeNodeGroup(): void {
    this.makeToolIdle();
    if (this.isChangingGroup()) {
      this.changesNode = ChangingNode.None;
      this.network.disableEditMode();
    } else {
      this.changesNode = ChangingNode.NodeGroup;
      this.groupInfo.colour = this.getGroupColorToApply();
    }
  }

  public getGroupColorToApply(): string {
    if (this.isChangingGroup()) {
      return this.groupsServices.getGroupColor(this.groupInfo.selected, this.defaultGroupColor);
    }
    return this.defaultGroupColor;
  }

  /**
   * Implements the logik to change the group color, this impacts all nodes having the same group
   */

  public changeNodeGroupColor() {
    const selectedGroup = this.groupsServices.findVisJsName(this.groupInfo.selected);
    if (selectedGroup === 'none') {
      return;
    }
    let loopActivated = false;
    this.groupsServices.setGroupColor(this.groupInfo.selected, this.groupInfo.colour);
    eval('this.options.groups.' + selectedGroup + '.color = ' + '\'' + this.groupInfo.colour + '\'');
    this.network.setOptions(this.options);
    this.nodes.forEach(node => {
      if (node.group === selectedGroup) {
        loopActivated = true;
        node.color = this.groupInfo.colour;
        this.network.updateClusteredNode(node.id, {group: selectedGroup});
      }
    });
    if (loopActivated) {
      this.makeSnapshot();
    }
    this.network.disableEditMode();
  }

  // Boolean switch value if someone wants to change the node label
  public changeNodeName(): void {
    this.makeToolIdle();
    if (this.isChangingNodeLabel()) {
      this.changesNode = ChangingNode.None;
    } else {
      this.changesNode = ChangingNode.NodeLabel;
    }
  }

  /**
   * Responsible to switch the delete flag of a node functionality
   * on or off if the button is pressed.
   */
  public deleteFlag(): void {
    this.network.disableEditMode();
    this.makeToolIdle();
    if (this.isDeletingFlag()) {
      this.changesNode = ChangingNode.None;
    } else {
      this.changesNode = ChangingNode.DeleteNodeFlag;
    }
  }

  /**
   * Delete Nodes and Edges in selection
   */
  public deleteNodeOrEdgeInNetwork(): void {
    this.network.deleteSelected();
    this.makeSnapshot();
  }

  /**
   * Converts the HTML class networkContainer to a png and
   * downloads it as Fairchain.png
   */
  public downloadGraphAsPng(): void {
    toPng(document.getElementById('networkContainer'))
      .then(dataUrl => {
        const link = document.createElement('a');
        link.download = 'FairChain.png';
        link.href = dataUrl;
        link.click();
      });
  }

  /**
   * Puts current nodes and edges variables into json syntax and stores it in a string.
   * Downloads the file as Graph.json with the method in importExport.service.
   */
  public exportGraph() {
    const text = this.importExportService.convertNetworkToJSON(this.nodes, this.edges, this.metadata, this.groupsServices.getRawGroups());
    const filename = 'Graph.json';
    this.importExportService.download(filename, text);
  }

  public getChangesEdge(): ChangingEdge {
    return this.changesEdge;
  }

  public getChangesNode(): ChangingNode {
    return this.changesNode;
  }

  public getCurrentTool(): Tools {
    return this.currentTool;
  }


  /**
   * Sends the received file to a method in importExport.service where the data gets parsed from the file.
   * Remakes the subscriptions and a snapshot to be fully functional again.
   *
   * @param files is the file selected to import.
   */
  public async importGraph(files: FileList): Promise<void> {
    this.updateData(await this.importExportService.upload(files.item(0)));
    this.makeSubscriptions();
    this.makeSnapshot();
  }

  /**
   * Changes the .image value of the Logo node to the base64 string of the imported logo
   * Adds a Logo node if there is not one already
   * Makes the Logo node an image node
   * Sends the file to importExport.service so the file can become a base64 string
   *
   * @param files the FileList containing the uploaded image
   */
  public async importLogo(files: FileList): Promise<void> {
    if (this.nodes.get('Logo') == null) {
      this.nodes.add({
        id: 'Logo',
        label: '',
        x: 59,
        y: 59,
        size: 50
      });
    }
    const firstNode = this.nodes.get('Logo');
    firstNode.shape = 'image';
    firstNode.image = await this.importExportService.uploadLogo(files[0]);
    this.nodes.update(firstNode);
    this.makeSnapshot();
  }

  public makeSnapshot() {
    this.undoRedoService.addSnapshot(this.nodes, this.edges, this.metadata, this.groupsServices.getRawGroups());
  }

  public stopShowingNodeHoverOption(): void {
    this.hoverOptionAddChildInfo.active = false;
  }

  public undo(): void {
    this.updateData(this.undoRedoService.getPredecessorSnapshot());
  }

  public redo(): void {
    this.updateData(this.undoRedoService.getSuccessorSnapshot());
  }

  public updateData(data): void {
    this.nodes = new DataSet();
    this.nodes.add(data.nodes);

    this.edges = new DataSet();
    this.edges.add(data.edges);

    this.metadata = data.metadata;

    this.groupsServices.setGroups(data.groups);
    this.groupInfo.groups = this.groupsServices.getGroupsName();
    this.groupInfo.selected = 'none';
    this.options.groups = this.groupsServices.getGroups(this.defaultGroupColor);

    this.data = {nodes: this.nodes, edges: this.edges};
    this.network = new Network(this.graph, this.data, this.options);
  }

  /**
   * Implements snackbar at the beginning to ask user for a logo node
   */
  private openSnackBar(): void {
    const snackBarRef = this.matSnackBar.open('Do you want to add a Logo?', 'Yes, please', {duration: 7000});
    snackBarRef.onAction().subscribe(() => this.addLogoFromSnackbar());
  }

  public updateNodeGroup(node: Node) {
    node.group = this.groupsServices.findVisJsName(this.groupInfo.selected);
    eval('node.color = this.options.groups.' + this.groupsServices.findVisJsName(this.groupInfo.selected) + '.color');
  }

  private addLogoFromSnackbar(): void {
    document.getElementById('logoToImport').click();
  }

  /**
   * Updates the edited edges in the dataset and then ends the editmode.
   *
   * @param edges all the edges with the done changes.
   */
  private editEdgeInDataset(edges: IdType[]): void {
    edges.forEach((id) => {
      const edgeData: Edge = this.edges.get(id);
      this.editEdgeBasedOnCurrentEdgeOption(edgeData);
      this.edges.update(edgeData);
    });
    this.network.disableEditMode();
    this.makeSnapshot();
  }

  private editNodeBasedOnCurrentNodeOption(nodeData: Node): void {
    if (this.changesNode === ChangingNode.NodeGroup) {
      this.updateNodeGroup(nodeData);
    }
    if (this.isDeletingFlag()) {
      nodeData.label = this.flagService.removeFlagFromLabel(nodeData.label);
    }
    if (this.isChangingFlag()) {
      nodeData.label = this.flagService.addOrChangeFlag(nodeData.label, this.nodeFlag);
    }
    if (this.isChangingNodeLabel()) {
      this.flagService.saveFlagFromLabel(nodeData.label);
      this.nodeEdgeLabel = this.flagService.removeFlagFromLabel(this.nodeEdgeLabel);
      nodeData.label = this.flagService.addOrChangeFlag(this.nodeEdgeLabel, this.flagService.currentFlag);
    }
  }

  private getEdgeRelabelPopUpRect(edgeId: IdType): RectOnDOM {
    const edge: Edge = this.edges.get(edgeId);

    // Computes center of edge
    const node1: Node = this.nodes.get(edge.from);
    const pos1: Position = this.network.canvasToDOM({x: node1.x, y: node1.y});

    const node2: Node = this.nodes.get(edge.to);
    const pos2: Position = this.network.canvasToDOM({x: node2.x, y: node2.y});

    const min_x = this.graph.getBoundingClientRect().left;
    const min_y = this.graph.getBoundingClientRect().top;
    const max_x = this.graph.getBoundingClientRect().right;
    const max_y = this.graph.getBoundingClientRect().bottom;

    return this.popUpGeometryService.getEdgeRelabelPopUpRect(pos1.x, pos1.y, pos2.x, pos2.y, min_x, min_y, max_x, max_y);
  }

  private getHoverOptionBoundingBox(nodeId: IdType): RectOnDOM {
    const bb = this.network.getBoundingBox(nodeId);
    const corner1 = this.network.canvasToDOM({x: bb.left, y: bb.top});
    const corner2 = this.network.canvasToDOM({x: bb.right, y: bb.bottom});

    const min_x = this.graph.getBoundingClientRect().left;
    const min_y = this.graph.getBoundingClientRect().top;
    const max_x = this.graph.getBoundingClientRect().right;
    const max_y = this.graph.getBoundingClientRect().bottom;

    return this.popUpGeometryService.getHoverOptionBoundingBox(corner1, corner2, min_x, min_y, max_x, max_y);
  }

  private getNodeRelabelPopUpRect(nodeId: IdType): RectOnDOM {
    const boundingBox = this.network.getBoundingBox(nodeId);
    const upperLeftCorner = this.network.canvasToDOM({x: boundingBox.left, y: boundingBox.top});
    const bottomRightCorner = this.network.canvasToDOM({x: boundingBox.right, y: boundingBox.bottom});
    const rect: RectOnDOM = {
      x: upperLeftCorner.x,
      y: upperLeftCorner.y,
      width: bottomRightCorner.x - upperLeftCorner.x,
      height: bottomRightCorner.y - upperLeftCorner.y
    };

    const min_x = this.graph.getBoundingClientRect().left;
    const min_y = this.graph.getBoundingClientRect().top;
    const max_x = this.graph.getBoundingClientRect().right;
    const max_y = this.graph.getBoundingClientRect().bottom;

    return this.popUpGeometryService.getNodeRelabelPopUpRect(rect, min_x, min_y, max_x, max_y);
  }

  private hoverOptionInfo(nodeId: IdType): HoverOptionOnDOM {
    let center: Position = this.network.getPosition(nodeId);
    center = this.network.canvasToDOM(center);

    const min_x = this.graph.getBoundingClientRect().left;
    const min_y = this.graph.getBoundingClientRect().top;
    const max_x = this.graph.getBoundingClientRect().right;
    const max_y = this.graph.getBoundingClientRect().bottom;

    return this.popUpGeometryService.getHoverOptionInfo(center, min_x, min_y, max_x, max_y);
  }

  private interruptAddingEdge(): void {
    this.stopEditMode();
    this.enableAddEdgeMode();
  }

  private isClickingOnCanvasInAddEdgeMode(params: any): boolean {
    return params.nodes.length === 0 && params.edges.length === 0 && this.isAddingEdge();
  }

  private isClickingOnCanvasInAddNodeMode(params: any): boolean {
    return params.nodes.length === 0 && params.edges.length === 0 && this.isAddingNode();
  }

  private isClickingOnEdgeInEdgeEditMode(params): boolean {
    return params.edges
      && params.edges.length >= 1
      && this.isInEdgeEditMode();
  }

  private isClickingOnNodeInAddEdgeMode(params: any): boolean {
    return this.isAddingEdge() && params.nodes.length > 0;
  }

  private isClickingOnNodeInAddNodeMode(params: any): boolean {
    return params.nodes.length > 0 && this.isAddingNode();
  }

  private isClickingOnNodeInNodeEditMode(params): boolean {
    return params.nodes
      && params.nodes.length >= 1
      && this.isInNodeEditMode();
  }

  private isDoubleClickingEdge(edges: IdType[], nodes: IdType[]): boolean {
    return edges.length === 1 && nodes.length !== 1;
  }

  private isDoubleClickingNode(nodes: IdType[]): boolean {
    return nodes.length === 1;
  }

  /**
   * Defines dynamic actions when clicking on certain objects in the network
   *
   * @param params needed to distinguish the different clicked elements from each other (node or edge)
   */
  private onClick(params): void {
    if (this.nodeRelabelPopUpInfo.active) {
      this.closeNodeRelabelPopUp();
    }
    if (this.edgeRelabelPopUpInfo.active) {
      this.closeEdgeRelabelPopUp();
    }
    // Defines node onClick actions
    if (this.isClickingOnNodeInNodeEditMode(params)) {
      this.network.editNode();
    }
    // Defines edge onClick actions
    if (this.isClickingOnNodeInAddEdgeMode(params)) {
      this.interruptAddingEdge();
    }
    if (this.isClickingOnEdgeInEdgeEditMode(params) && params.nodes.length === 0) {
      this.editEdgeInDataset(params.edges);
    }
    if (this.isClickingOnNodeInAddNodeMode(params)) {
      this.stopAddMode();
    }
    if (this.isClickingOnCanvasInAddNodeMode(params)) {
      this.enableAddNodeMode();
    }
    if (this.isClickingOnCanvasInAddEdgeMode(params)) {
      this.enableAddEdgeMode();
    }
  }

  /**
   * Defines dynamic actions when double clicking on certain objects in the network
   *
   * @param params needed to distinguish the different double clicked elements from each other (node or edge)
   */
  private onDoubleClick(pointer): void {
    this.network.disableEditMode();
    if (this.isDoubleClickingNode(pointer.nodes)) {
      this.showRelabelPopUp(pointer.nodes[0]);
    }
    if (this.isDoubleClickingEdge(pointer.edges, pointer.nodes)) {
      this.showEdgeRelabelPopUp(pointer.edges[0]);
    }
  }

  /**
   * Defines dynamic actions when stop dragging certain objects in the network
   *
   * @param params needed to distinguish the different dragged node
   */
  private onDragEnd(params): void {
    if (params.nodes.length > 0 && this.nodes.length >= 2) {
      this.updateNodePositions();
      this.makeSnapshot();
    }
  }

  private showAddChildNodeOptions(nodeId: IdType): void {
    this.hoverOptionAddChildInfo.nodeId = nodeId;
    this.hoverOptionAddChildInfo.addChildNodeInfo = this.hoverOptionInfo(nodeId);
    this.hoverOptionAddChildInfo.boundingBox = this.getHoverOptionBoundingBox(nodeId);
    this.hoverOptionAddChildInfo.active = true;
  }

  // Very ugly code will be fixed in refactor
  private showEdgeRelabelPopUp(edgeId: IdType): void {
    this.updateNodePositions();
    this.edgeRelabelPopUpInfo.edgeId = edgeId;
    this.edgeRelabelPopUpInfo.rect = this.getEdgeRelabelPopUpRect(edgeId);
    this.edgeRelabelPopUpInfo.label = this.edges.get(edgeId).label;
    this.edgeRelabelPopUpInfo.active = true;
  }

  private showRelabelPopUp(nodeId: IdType): void {
    this.nodeRelabelPopUpInfo.nodeId = nodeId;
    this.nodeRelabelPopUpInfo.rect = this.getNodeRelabelPopUpRect(nodeId);
    if (this.nodes.get(nodeId).label === undefined) {
      this.nodeRelabelPopUpInfo.label = this.nodes.get(nodeId).label;
    } else {
      if (this.emojis.some(v => this.nodes.get(nodeId).label.includes(v))) {
        this.flagService.saveFlagFromLabel(this.nodes.get(nodeId).label);
        this.nodeRelabelPopUpInfo.label = this.nodes.get(nodeId).label.slice(5);
      } else {
        this.flagService.saveFlagFromLabel(this.nodes.get(nodeId).label);
        this.nodeRelabelPopUpInfo.label = this.nodes.get(nodeId).label;
      }
    }
    this.nodeRelabelPopUpInfo.active = true;
  }

  private updateNodePositions(): void {
    this.nodes.getIds().forEach((id: IdType) => {
      const pos: Position = this.network.getPosition(id);
      this.nodes.update({id, x: pos.x, y: pos.y});
    });
  }

}
