import { Injectable } from '@angular/core';
import {Node, Edge, Data, DataSetNodes, DataSetEdges} from "vis-network/peer/esm/vis-network";
import { ImportExportService } from './importExport.service';

@Injectable({
    providedIn: 'root'
  })

export class UndoRedoService{
    private snapshots=[];
    private data: Data = {
        nodes: [],
        edges: []
      };
    private counter = -1;

    constructor(private importExportService:ImportExportService) { }

    public getPredecessorSnapshot(){
        if (this.counter == 0){
            return this.data;
        }
        else {
            this.counter--;
            return this.importExportService.overwriteData(JSON.parse(this.snapshots[this.counter]));
        }
    }

    public getSuccessorSnapshot(){
        if (this.counter < this.snapshots.length - 1){
            this.counter++;
            return this.importExportService.overwriteData(JSON.parse(this.snapshots[this.counter]));
        }
        else{
            return this.importExportService.overwriteData(JSON.parse(this.snapshots[this.counter]));
        }
    }

    public addSnapshot(nodes: DataSetNodes, edges: DataSetEdges){
        this.counter++;
        this.snapshots[this.counter] = this.importExportService.convertNetworkToJSON(nodes, edges)
        this.snapshots = this.snapshots.slice(0, this.counter + 1);
    }
}