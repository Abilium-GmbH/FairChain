import { Injectable } from '@angular/core';
import { DataSetNodes, DataSetEdges} from "vis-network/peer/esm/vis-network";
import { ImportExportService } from './importExport.service';

@Injectable({
    providedIn: 'root'
  })

export class UndoRedoService{
    private snapshots=[];
    private counter = 0;

    constructor(private importExportService:ImportExportService) {
        this.snapshots.push("{\"nodes\":[],\"edges\":[]}");
    }

    public getPredecessorSnapshot(){
        if (this.counter > 0) this.counter--;
        return JSON.parse(this.snapshots[this.counter]);
    }

    public getSuccessorSnapshot(){
        if (this.counter < this.snapshots.length - 1) this.counter++;
        return JSON.parse(this.snapshots[this.counter]);
    }

    public addSnapshot(nodes: DataSetNodes, edges: DataSetEdges){
        if (this.counter + 1 < this.snapshots.length) this.snapshots.splice(this.counter + 1, this.snapshots.length);
        this.counter++;
        this.snapshots[this.counter] = this.importExportService.convertNetworkToJSON(nodes, edges);

    }
}