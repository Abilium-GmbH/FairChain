import { ImportExportService } from './importExport.service'
import { DataSetNodes, DataSetEdges } from "vis-network/peer/esm/vis-network";
import { DataSet } from "vis-data/peer/esm/vis-data"
import { Group } from './interfaces/Group';

describe('ImportExportService', () => {
    let service: ImportExportService;
    beforeEach(() => { service = new ImportExportService(); });

    it('#convertNetworkToJSON turns network into valid JSON', () => {
        let nodes: DataSetNodes = new DataSet();
        let edges: DataSetEdges = new DataSet();
        let metadata: string = "This is a metadata";
        let groups: Group[] = [];

        nodes.add([
            { id: '1', label: 'Node 1', x: 0, y: 0, color: '#fbff00' },
            { id: '2', label: 'Node 2', x: 100, y: 0, color: '#00ff4c' },
            { id: '3', label: 'Node 3', x: 0, y: -200, color: '#f00add' }])
        edges.add([
            { from: '1', to: '2', id: '1' },
            { from: '2', to: '3', id: '2' }
        ])
        expect(service.convertNetworkToJSON(nodes, edges, metadata, groups)).toEqual("{\"nodes\":[{\"id\":\"1\",\"label\":\"Node 1\",\"x\":0,\"y\":0,\"color\":\"#fbff00\"},{\"id\":\"2\",\"label\":\"Node 2\",\"x\":100,\"y\":0,\"color\":\"#00ff4c\"},{\"id\":\"3\",\"label\":\"Node 3\",\"x\":0,\"y\":-200,\"color\":\"#f00add\"}],\"edges\":[{\"from\":\"1\",\"to\":\"2\",\"id\":\"1\"},{\"from\":\"2\",\"to\":\"3\",\"id\":\"2\"}],\"metadata\":\"This is a metadata\",\"groups\":[[]]}");
    });

    it('#checkThatDataIsValid succeeds for empty network', () => {
        let data = { nodes: [], edges: [] };
        expect(service.checkThatImportDataIsValid(data)).toBeTrue()
    });

    it('#checkThatDataIsValid succeeds for network with nodes and no edges', () => {
        let data = { nodes: [{ id: '1', x: 0, y: 100, label: 'Node 1' }], edges: [] };
        expect(service.checkThatImportDataIsValid(data)).toBeTrue()
    });

    it('#checkThatDataIsValid succeeds for normal network', () => {
        let data = {
            nodes: [
                { id: '1', label: 'Node 1', x: 0, y: 0, color: '#fbff00' },
                { id: '2', label: 'Node 2', x: 100, y: 0, color: '#00ff4c' },
                { id: '3', label: 'Node 3', x: 0, y: -200, color: '#f00add' }],
            edges: [
                { from: '1', to: '2', id: '1' },
                { from: '2', to: '3', id: '2' }]
        };
        expect(service.checkThatImportDataIsValid(data)).toBeTrue()
    });

    it('#checkThatDataIsValid fails if nodes is missing', () => {
        let data = { edges: [] };
        expect(() => service.checkThatImportDataIsValid(data)).toThrowError();
    });

    it('#checkThatDataIsValid fails if edges is missing', () => {
        let data = { nodes: [] };
        expect(() => service.checkThatImportDataIsValid(data)).toThrowError();
    });

    it('#checkThatDataIsValid fails if there are redundant attributes', () => {
        let data = { nodes: [], edges: [], someRandomCrap: [] };
        expect(() => service.checkThatImportDataIsValid(data)).toThrowError();
    });

    it('#checkThatDataIsValid fails if nodes value is not an array', () => {
        let data = { nodes: { notAnArray: true }, edges: [] };
        expect(() => service.checkThatImportDataIsValid(data)).toThrowError();
    });

    it('#checkThatDataIsValid fails if edges value is not an array', () => {
        let data = { nodes: [], edges: { notAnArray: true } };
        expect(() => service.checkThatImportDataIsValid(data)).toThrowError();
    });

    it('#checkThatDataIsValid fails if nodes array elements is missing attributes', () => {
        let data = { nodes: [{ id: '1', x: 0, label: 'Node 1' }], edges: [] };
        expect(() => service.checkThatImportDataIsValid(data)).toThrowError();
    });

    it('#checkThatDataIsValid fails if edges array elements is mssing attributes', () => {
        let data = { nodes: [{ id: '1', x: 0, y: 0, label: 'Node 1' }, { id: '2', x: 100, y: 0, label: 'Node 2' }], edges: [{ from: '1', id: '1' }] };
        expect(() => service.checkThatImportDataIsValid(data)).toThrowError();
    });

    it('#checkThatDataIsValid fails if there are edges but no nodes', () => {
        let data = { nodes: [], edges: [{ from: 'If there are no nodes', to: 'can there exist an edge?', id: 'Answer: No' }] };
        expect(() => service.checkThatImportDataIsValid(data)).toThrowError();
    });

    it('#checkThatDataIsValid fails if there are nodes in the edges array that do not exist in the node array', () => {
        let data = { nodes: [{ id: '1', x: 0, y: 0, label: 'Node 1' }, { id: '2', x: 100, y: 0, label: 'Node 2' }], edges: [{ from: 'This node does not exist', to: 'As does this one', id: '1' }] };
        expect(() => service.checkThatImportDataIsValid(data)).toThrowError();
    });

    it('#upload should work on empty network', (done) => {
        var file = new File(["{\"nodes\":[],\"edges\":[]}"], "foo.json", {
            type: "application/json",
        });
        service.upload(file)
            .then((imp) => {
                expect(imp).not.toBeUndefined();
                done();
            })
            .catch((msg) => {
                done.fail(new Error('Import should have worked'));
            });
    });

    it('#upload should fail if file type is not json', (done) => {
        var file = new File(["{\"nodes\":[],\"edges\":[]}"], "foo.BingOfFileTypes", {
            type: "text/plain",
        });
        service.upload(file)
            .then(() => done.fail('Import should not have worked'))
            .catch((msg) => {
                expect(msg).toEqual('The file type is not JSON');
                done();
            });
    });

    it('#upload should fail if file size is too large', (done) => {
        var file = new File([""], "foo.json", {
            type: "application/json"
        });
        file['Size'] = 1e6;
        service.upload(file)
            .then(() => done.fail('Import should not have worked'))
            .catch((msg) => {
                expect(msg).toEqual('The file size is too large');
                done();
            });
    });
})
