import { Injectable } from '@angular/core';
import { Node } from "vis-network/peer/esm/vis-network";
import { emojis as flags } from './emojis'

@Injectable({
    providedIn: 'root'
})
export class FlagService{

    public addOrChangeFlag(nodeData: Node, nodeflag){
        nodeData.label = this.removeFlagFromLabel(nodeData.label)
        return nodeflag +"\n" + nodeData.label;
    }

    public removeFlagFromLabel(label: string){
        if (flags.some(v => label.includes(v))){
            label = label.slice(5);
        }
        return label;
    }

    public changeLabelWithoutChangingFlag(originalLabel: string, newLabel: string){
        if (flags.some(v => originalLabel.includes(v))){
            newLabel = originalLabel.slice(0,5) + newLabel;
        }
        return newLabel;
    }
}