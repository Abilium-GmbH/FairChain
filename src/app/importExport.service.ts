import { identifierModuleUrl } from '@angular/compiler';
import { Injectable } from '@angular/core';
import { strict as assert } from 'assert';

import {Node, Edge, Data, DataSetNodes, DataSetEdges, IdType} from "vis-network/peer/esm/vis-network";

@Injectable({
    providedIn: 'root'
  })
export class ImportExportService{

  private nodes: Node[] = [];
  private edges: Edge[] = [];
  private data: Data = {
    nodes: this.nodes,
    edges: this.edges,
  };

  /**
   * Creates a temporary, non-visible HTML element with a download function, clicks on it and removes it from the document
   * Gets called when the export button is pressed
   * @param filename is the name of the file that will be created
   * @param text is the json that goes into the file
   */

  public download(filename, text) {
    var element = document.createElement('a');
    element.setAttribute('href', 'data:json/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
  }

  /**
   * Overwrites the data variable with the data from parsedImportedJson
   * @param parsedImportedJson is the object that you get after deserializing the imported JSON file
   */

  public overwriteData(parsedImportedJson){
    try{
      this.data = {
        nodes: this.extractNodeData(parsedImportedJson.nodes),
        edges: this.extractEdgeData(parsedImportedJson.edges)
      };
      return this.data;
    }
    catch{
      return [];
    }
  }

  /**
   * Extracts the data from the parameter into an array of nodes
   * @param data is the node data that has to be extracted
   * @returns the array of nodes
   */

  private extractNodeData(data) {
    return data.map((element) => {
      if (!element.x) throw new Error('All nodes must have an x-coordinate');
      if (!element.y) throw new Error('All nodes must have an y-coordinate');
      if (!element.id) throw new Error('All nodes must have an id');
      return element
    });
  }
  
  /**
   * Extracts the data from the parameter into an array of edges
   * @param data is the edge data that has to be extracted
   * @returns the array of edges
   */

   private extractEdgeData(data) {
    return data.map((element) => {
      if (!element.from) throw new Error('All edges must have a source node');
      if (!element.to) throw new Error('All edges must have a target node');
      if (!element.id) throw new Error('All edges must have an id');
      return element
    });
  }
  
  //TODO make sure that the data is correct
  private checkThatImportDataIsValid(data) {
    assert(data.nodes, 'The import file has no attribute \'nodes\'');
    assert(data.edges, 'The import file has no attribute \'edges\'');
  }

  public async upload(file: File){
    return new Promise ((resolve, reject) => {
      const reader = new FileReader();
      var importedJson;
      var service = new ImportExportService;
      reader.readAsBinaryString(file);

      reader.onload = function(e) {
        importedJson = e.target.result;
        const parsedImportedJson = JSON.parse(importedJson);
        console.log(parsedImportedJson);
        service.checkThatImportDataIsValid(parsedImportedJson);
        resolve(parsedImportedJson);
      }
    })
  }

  public convertNetworkToJSON(nodes: DataSetNodes, edges: DataSetEdges): string {
    return "{\"nodes\":[NODES],\"edges\":[EDGES]}"
      .replace('NODES', this.datasetToJSON(nodes))
      .replace('EDGES', this.datasetToJSON(edges));
  }

  private datasetToJSON(data: DataSetNodes | DataSetEdges): string 
  {
    if (data.length === 0) return '';
    return data.getIds().map((id: IdType) => {
      return JSON.stringify(data.get(id))
    }).join(',');
  }

  public getNodes(){
    return this.nodes;
  }

  public getEdges(){
    return this.edges;
  }
}