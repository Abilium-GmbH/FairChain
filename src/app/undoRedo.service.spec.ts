import { UndoRedoService } from './undoRedo.service'
import { ImportExportService } from './importExport.service'
import { DataSetNodes, DataSetEdges } from "vis-network/peer/esm/vis-network";
import { DataSet } from "vis-data/peer/esm/vis-data"

describe('UndoRedoService', () => {
    let service: UndoRedoService;
    let importExportService: ImportExportService;
    let nodes: DataSetNodes;
    let edges: DataSetEdges;
    let network;
    let emptyNetwork = {nodes:[], edges:[]};
    beforeEach(() => { 
        importExportService = new ImportExportService();
        service = new UndoRedoService(importExportService); 
        nodes = new DataSet();
        edges = new DataSet();
        nodes.add([
            {id:'1', label:'Node 1', x:-10, y:0},
            {id:'2', label:'Node 2', x:10, y:0}]);
        edges.add([
            {id:'1', from:'1', to:'2'}]);
        network = {nodes:[{id:'1', label:'Node 1', x:-10, y:0},{id:'2', label:'Node 2', x:10, y:0}], edges:[{id:'1', from:'1', to:'2'}]};
    });

    it('#getPredecessorSnapshot works for untampered service', () => {
        expect(service.getPredecessorSnapshot()).toEqual(emptyNetwork);
    });

    it('#getSuccessorSnapshot works for untampered service', () => {
        expect(service.getSuccessorSnapshot()).toEqual(emptyNetwork);
    });

    it('#addSnapshot does not throw errrors', () => {
        expect(() => service.addSnapshot(nodes, edges)).not.toThrowError();
    });

    it('adding a snapshot and getting successor returns network', () => {
        service.addSnapshot(nodes,edges);
        expect(service.getSuccessorSnapshot()).toEqual(network);
    });

    it('adding a snapshot and getting predecessor Snapshot returns empty network', () => {
        service.addSnapshot(nodes,edges);
        expect(service.getPredecessorSnapshot()).toEqual(emptyNetwork);
    });

    it('can revert an \'undo\' operation', () => {
        service.addSnapshot(nodes,edges);
        service.getPredecessorSnapshot();
        expect(service.getSuccessorSnapshot()).toEqual(network);
    });

    it('if change happens in the past, the future is overwritten', () => {
        service.addSnapshot(nodes,edges);
        service.getPredecessorSnapshot();
        nodes.update([{id:'1', label:'New Node 1'},{id:'2', label:'New Node 2'}])
        service.addSnapshot(nodes,edges);
        network.nodes[0].label = 'New Node 1';
        network.nodes[1].label = 'New Node 2';
        expect(service.getSuccessorSnapshot()).toEqual(network);
    });
})