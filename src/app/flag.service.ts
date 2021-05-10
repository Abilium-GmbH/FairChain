import { Injectable } from '@angular/core';
import { Node } from "vis-network/peer/esm/vis-network";
import { emojis as flags } from './emojis'

@Injectable({
    providedIn: 'root'
})
export class FlagService{

    public addOrChangeFlag(nodeData: Node, nodeflag){
        nodeData.label = this.deleteFlag(nodeData.label)
        return nodeData.label + nodeflag;
    }

    private deleteFlag(label: string){
        if (flags.some(v => label.includes(v))){
            label = label.slice(0,-4);
        }
        return label;
    }
}