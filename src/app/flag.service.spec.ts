import { DataSetNodes } from "vis-network/peer/esm/vis-network";
import { FlagService } from './flag.service';
import { DataSet } from "vis-data/peer/esm/vis-data"

describe('FlagsService', () =>{
    let service: FlagService;
    beforeEach(() => { service = new FlagService(); });

    it('#addOrChangeFlag succeeds for empty label', () => {
        let nodes: DataSetNodes = new DataSet();
        nodes.add({id: '1', label: "hello", x: 0, y:0, color:'#fbff00'})
        expect(service.addOrChangeFlag(nodes.get(1),'🇨🇭')).toEqual('🇨🇭\nhello');
    });

})