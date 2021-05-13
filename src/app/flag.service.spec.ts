import { DataSetNodes } from "vis-network/peer/esm/vis-network";
import { FlagService } from './flag.service';
import { DataSet } from "vis-data/peer/esm/vis-data"

describe('FlagsService', () =>{
    let service: FlagService;
    beforeEach(() => { service = new FlagService(); });

    it('#addOrChangeFlag succeeds for normal label without a flag', () => {
        let nodes: DataSetNodes = new DataSet();
        nodes.add({id: 1, label: 'hello', x: 0, y:0, color:'#fbff00'})
        expect(service.addOrChangeFlag(nodes.get(1),'🇨🇭')).toEqual('🇨🇭\nhello');
    });

    it('#addOrChangeFlag succeeds for empty label', () => {
        let nodes: DataSetNodes = new DataSet();
        nodes.add({id: 1, label: '', x: 0, y:0, color:'#fbff00'})
        expect(service.addOrChangeFlag(nodes.get(1),'🇨🇭')).toEqual('🇨🇭\n');
    });

    it('#addOrChangeFlag succeeds with replace a flag of a label', () => {
        let nodes: DataSetNodes = new DataSet();
        nodes.add({id: 1, label: '🇺🇸\nhello', x: 0, y:0, color:'#fbff00'})
        expect(service.addOrChangeFlag(nodes.get(1),'🇨🇭')).toEqual('🇨🇭\nhello');
    });

    it('#changeLabelWithoutChangingFlag succeeds when both labels do not have a flag', () => {
        let nodes: DataSetNodes = new DataSet();
        nodes.add({id: 1, label: 'hello', x: 0, y:0, color:'#fbff00'})
        expect(service.changeLabelWithoutChangingFlag(nodes.get(1).label,'bye')).toEqual('bye');
    });

    it('#changeLabelWithoutChangingFlag succeeds when newLabel is empty', () => {
        let nodes: DataSetNodes = new DataSet();
        nodes.add({id: 1, label: 'hello', x: 0, y:0, color:'#fbff00'})
        expect(service.changeLabelWithoutChangingFlag(nodes.get(1).label,'')).toEqual('');
    });

    it('#changeLabelWithoutChangingFlag succeeds when originalLabel is empty', () => {
        let nodes: DataSetNodes = new DataSet();
        nodes.add({id: 1, label: '', x: 0, y:0, color:'#fbff00'})
        expect(service.changeLabelWithoutChangingFlag(nodes.get(1).label,'bye')).toEqual('bye');
    });

    it('#changeLabelWithoutChangingFlag succeeds when originalLabel has a flag', () => {
        let nodes: DataSetNodes = new DataSet();
        nodes.add({id: 1, label: '🇺🇸\nhello', x: 0, y:0, color:'#fbff00'})
        expect(service.changeLabelWithoutChangingFlag(nodes.get(1).label,'bye')).toEqual('🇺🇸\nbye');
    });

    it('#changeLabelWithoutChangingFlag succeeds when originalLabel is only a flag', () => {
        let nodes: DataSetNodes = new DataSet();
        nodes.add({id: 1, label: '🇺🇸\n', x: 0, y:0, color:'#fbff00'})
        expect(service.changeLabelWithoutChangingFlag(nodes.get(1).label,'bye')).toEqual('🇺🇸\nbye');
    });


})