import { Injectable } from '@angular/core';
import * as vis from 'vis-network';
import { ImportExportService } from './importExport.service';

@Injectable({
    providedIn: 'root'
  })

export class UndoRedoService{
    private snapshots=[];
    private data: vis.Data = {
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

    public addSnapshot(nodes, edges){
        this.counter++;
        this.snapshots[this.counter] = "{\"nodes\":" + JSON.stringify(nodes) +",\"edges\":" + JSON.stringify(edges)+"}";
        this.snapshots = this.snapshots.slice(0, this.counter + 1);
    }
}