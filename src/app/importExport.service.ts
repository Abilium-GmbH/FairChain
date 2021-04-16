import { Injectable } from '@angular/core';
import * as vis from 'vis-network';

@Injectable({
    providedIn: 'root'
  })

export class ImportExportService{

  private nodes: vis.Node[] = [];
  private edges: vis.Edge[] = [];
  private data: vis.Data = {
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
    this.data = {
      nodes: this.extractNodeData(parsedImportedJson.nodes),
      edges: this.extractEdgeData(parsedImportedJson.edges)
    };
  }

  /**
   * Extracts the data from the parameter into an array of nodes
   * @param data is the node data that has to be extracted
   * @returns the array of nodes
   */
  private extractNodeData(data) {
    var networkNodes = [];

    data.forEach(function (elem, index, array) {
      networkNodes.push({
        id: elem.id,
        label: elem.label,
        x: elem.x,
        y: elem.y,
        color: elem.color,
        fixed: elem.fixed,
        font: elem.font,
        icon: elem.icon,
        imagePadding: elem.imagePadding,
        shadow: elem.shadow
      });
    });
    return networkNodes;
  }

  /**
   * Extracts the data from the parameter into an array of edges
   * @param data is the edge data that has to be extracted
   * @returns the array of edges
   */
  private extractEdgeData(data) {
    var networkEdges = [];

    data.forEach(function (elem) {
      networkEdges.push({
        id: elem.id,
        from: elem.from,
        to: elem.to,
        label: elem.label,
        color: elem.color

      });
    });
    return networkEdges;
  }

  public getData(){
    return this.data;
  }
}
