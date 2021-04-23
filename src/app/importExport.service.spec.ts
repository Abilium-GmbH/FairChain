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

    it('#overwriteData should return the same input', () => {
        expect(service.overwriteData({
            "nodes":[{
                "id":"1","x":-16,"y":-96,"label":"new"},
                {"id":"2","x":1,"y":26,"label":"new"}],
            "edges":[{
                "id":"3","from":"2","to":"1"}]}))
            .toEqual({
            "nodes":[{
                "id":"1",
                "x":-16,
                "y":-96,
                "label":"new",
                "color": undefined,
                "fixed": undefined,
                "font": undefined,
                "icon": undefined,
                "imagePadding": undefined,
                "shadow": undefined},
                {"id":"2",
                "x":1,
                "y":26,
                "label":"new",
                "color": undefined,
                "fixed": undefined,
                "font": undefined,
                "icon": undefined,
                "imagePadding": undefined,
                "shadow": undefined}],
            "edges":[{
                "id":"3",
                "from":"2",
                "to":"1",
                "label": undefined,
                "color": undefined}]});
    });

    });