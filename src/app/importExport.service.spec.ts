import {ImportExportService} from './importExport.service'

describe('ImportExportService', () => {
    let service: ImportExportService;
    beforeEach(() => { service = new ImportExportService(); });
  
    it('#getNodes should return []', () => {
      expect(service.getNodes()).toEqual([]);
    });

    it('#getEdges should return []', () => {
      expect(service.getEdges()).toEqual([]);
    });

    it('#overwriteData should return the same empty array input', () => {
        expect(service.overwriteData({"nodes":[],"edges":[]})).toEqual({"nodes":[],"edges":[]});
    });

    it('#overwriteData should return "undefined" at empty variables in JSON', () => {
        expect(service.overwriteData({
            "nodes":[{
                "id":"1","x":-16,"y":-96,"label":"new"},
                {"id":"2","x":1,"y":26,"label":"new"}],
            "edges":[{
                "id":"3","from":"2","to":"1"}]}))
            .toEqual({
            "nodes":[{
                "id":"1","x":-16,"y":-96,"label":"new"},
                {"id":"2","x":1,"y":26,"label":"new"}],
            "edges":[{
                "id":"3","from":"2","to":"1"}]});
    });

    it('#overwriteData should return [] at random input', () => {
        expect(service.overwriteData("hey")).toEqual([]);
    });

    it('#overwriteData should return [] at random property label', () => {
        expect(service.overwriteData({"hey":[
            {"id":"2","x":1,"y":26,"label":"new"}],
        "edges":[{
            "id":"3","from":"2","to":"1"}]})).toEqual([]);
    });

    it('#overwriteData should skip invalid node data', () => {
        expect(service.overwriteData({
        "nodes":[
            "hey",
            {"id":"2","x":1,"y":26,"label":"new"}],
        "edges":[{
            "id":"3","from":"2","to":"1"}]}))
        .toEqual({
        "nodes":[{"id":"2",
            "x":1,
            "y":26,
            "label":"new",
            }],
        "edges":[{
            "id":"3",
            "from":"2",
            "to":"1",}]
        });
    })

    it('#overwriteData should skip invalid edges data', () => {
        expect(service.overwriteData({
        "nodes":[
            {"id":"2","x":1,"y":26,"label":"new"}],
        "edges":["hey", {"id":"3","from":"2","to":"1"}]}))
        .toEqual({
        "nodes":[{"id":"2",
            "x":1,
            "y":26,
            "label":"new",
            }],
        "edges":[{
            "id":"3",
            "from":"2",
            "to":"1",}]
        });
    })
})