import { UndoRedoService } from './undoRedo.service'
import { ImportExportService } from './importExport.service'
import { DataSetNodes, DataSetEdges } from "vis-network/peer/esm/vis-network";
import { DataSet } from "vis-data/peer/esm/vis-data"
import { GroupsService } from './groups.service';

describe('UndoRedoService', () => {
    let service: UndoRedoService;
    let importExportService: ImportExportService;
    let groupsService : GroupsService;
    let nodes: DataSetNodes;
    let edges: DataSetEdges;
    let metadata: string;
    let groups;
    let network;
    let emptyNetwork = { nodes: [], edges: [], metadata: "", groups: []};
    beforeEach(() => {
        importExportService = new ImportExportService();
        service = new UndoRedoService(importExportService);
        nodes = new DataSet();
        edges = new DataSet();
        metadata = "This is a metadata"
        groupsService = new GroupsService();
        groups = groupsService.getRawGroups();
        nodes.add([
            { id: '1', label: 'Node 1', x: -10, y: 0 },
            { id: '2', label: 'Node 2', x: 10, y: 0 }]);
        edges.add([
            { id: '1', from: '1', to: '2' }]);
        network = { nodes: [{ id: '1', label: 'Node 1', x: -10, y: 0 }, { id: '2', label: 'Node 2', x: 10, y: 0 }], edges: [{ id: '1', from: '1', to: '2' }], metadata: "This is a metadata", groups: [ Object({ name: 'ethical', color: '#6370ff', visJsName: 'group0' }), Object({ name: 'unethical', color: '#fcba03', visJsName: 'group1' }), Object({ name: 'sustainable', color: '#51cf55', visJsName: 'group2' }), Object({ name: 'unsustainable', color: '#e8513a', visJsName: 'group3' }) ] };
    });

    it('#getPredecessorSnapshot works for untampered service', () => {
        expect(service.getPredecessorSnapshot()).toEqual(emptyNetwork);
    });

    it('#getSuccessorSnapshot works for untampered service', () => {
        expect(service.getSuccessorSnapshot()).toEqual(emptyNetwork);
    });

    it('#addSnapshot does not throw errrors', () => {
        expect(() => service.addSnapshot(nodes, edges, metadata, groups)).not.toThrowError();
    });

    it('adding a snapshot and getting successor returns network', () => {
        service.addSnapshot(nodes, edges, metadata, groups);
        expect(service.getSuccessorSnapshot()).toEqual(network);
    });

    it('adding a snapshot and getting predecessor Snapshot returns empty network', () => {
        service.addSnapshot(nodes, edges, metadata, groups);
        expect(service.getPredecessorSnapshot()).toEqual(emptyNetwork);
    });

    it('can revert an \'undo\' operation', () => {
        service.addSnapshot(nodes, edges, metadata, groups);
        service.getPredecessorSnapshot();
        expect(service.getSuccessorSnapshot()).toEqual(network);
    });

    it('if change happens in the past, the future is overwritten', () => {
        service.addSnapshot(nodes, edges, metadata, groups);
        service.getPredecessorSnapshot();
        nodes.update([{ id: '1', label: 'New Node 1' }, { id: '2', label: 'New Node 2' }])
        service.addSnapshot(nodes, edges, metadata, groups);
        network.nodes[0].label = 'New Node 1';
        network.nodes[1].label = 'New Node 2';
        expect(service.getSuccessorSnapshot()).toEqual(network);
    });
})