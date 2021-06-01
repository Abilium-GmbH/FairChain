import { DataSetNodes } from "vis-network/peer/esm/vis-network";
import { FlagService } from './flag.service';
import { DataSet } from "vis-data/peer/esm/vis-data"

describe('FlagsService', () => {
    let service: FlagService;
    let nodes: DataSetNodes;
    beforeEach(() => { service = new FlagService(); nodes = new DataSet(); });

    it('#addOrChangeFlag succeeds for normal label without a flag', () => {
        nodes.add({ id: 1, label: 'hello', x: 0, y: 0, color: '#fbff00' })
        expect(service.addOrChangeFlag(nodes.get(1).label, '🇨🇭')).toEqual('🇨🇭\nhello');
    });

    it('#addOrChangeFlag succeeds for empty label', () => {
        nodes.add({ id: 1, label: '', x: 0, y: 0, color: '#fbff00' })
        expect(service.addOrChangeFlag(nodes.get(1).label, '🇨🇭')).toEqual('🇨🇭\n');
    });

    it('#addOrChangeFlag succeeds with replace a flag of a label', () => {
        nodes.add({ id: 1, label: '🇺🇸\nhello', x: 0, y: 0, color: '#fbff00' })
        expect(service.addOrChangeFlag(nodes.get(1).label, '🇨🇭')).toEqual('🇨🇭\nhello');
    });

    it('#changeLabelWithoutChangingFlag succeeds when both labels do not have a flag', () => {
        nodes.add({ id: 1, label: 'hello', x: 0, y: 0, color: '#fbff00' })
        expect(service.changeLabelWithoutChangingFlag(nodes.get(1).label, 'bye')).toEqual('bye');
    });

    it('#changeLabelWithoutChangingFlag succeeds when newLabel is empty', () => {
        nodes.add({ id: 1, label: 'hello', x: 0, y: 0, color: '#fbff00' })
        expect(service.changeLabelWithoutChangingFlag(nodes.get(1).label, '')).toEqual('');
    });

    it('#changeLabelWithoutChangingFlag succeeds when originalLabel is empty', () => {
        nodes.add({ id: 1, label: '', x: 0, y: 0, color: '#fbff00' })
        expect(service.changeLabelWithoutChangingFlag(nodes.get(1).label, 'bye')).toEqual('bye');
    });

    it('#changeLabelWithoutChangingFlag succeeds when originalLabel has a flag', () => {
        nodes.add({ id: 1, label: '🇺🇸\nhello', x: 0, y: 0, color: '#fbff00' })
        expect(service.changeLabelWithoutChangingFlag(nodes.get(1).label, 'bye')).toEqual('🇺🇸\nbye');
    });

    it('#changeLabelWithoutChangingFlag succeeds when originalLabel is only a flag', () => {
        nodes.add({ id: 1, label: '🇺🇸\n', x: 0, y: 0, color: '#fbff00' })
        expect(service.changeLabelWithoutChangingFlag(nodes.get(1).label, 'bye')).toEqual('🇺🇸\nbye');
    });

    it('currentFlag starts empty', () => {
        expect(service.currentFlag).toEqual("");
    });

    it('#saveFlagFromLabel with a label with a emoji as input should save the emoji in currentFlag', () => {
        service.saveFlagFromLabel("🇺🇸\nhello")
        expect(service.currentFlag).toEqual('🇺🇸');
    });

    it('#saveFlagFromLabel with only a emoji as input should save the emoji in currentFlag', () => {
        service.saveFlagFromLabel("🇺🇸")
        expect(service.currentFlag).toEqual('🇺🇸');
    });

    it('#saveFlagFromLabel with no emojis as input should save a empty string in currentFlag', () => {
        service.saveFlagFromLabel("hello")
        expect(service.currentFlag).toEqual('');
    });

    it('#saveFlagFromLabel with an empty string as input should save a empty string in currentFlag', () => {
        service.saveFlagFromLabel("")
        expect(service.currentFlag).toEqual('');
    });

    it('#RemoveFlagFromLabel with an empty string as input should return a empty string', () => {
        expect(service.removeFlagFromLabel("")).toEqual('');
    });
})