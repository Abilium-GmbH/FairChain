import {Injectable} from '@angular/core';
import {ImportData} from './interfaces/importData';
import {DataSetNodes, DataSetEdges, IdType, Color} from 'vis-network/peer/esm/vis-network';

@Injectable({
  providedIn: 'root'
})
export class ImportExportService {
  /**
   * Creates a temporary, non-visible HTML element with a download function, clicks on it and removes it from the document
   * Gets called when the export button is pressed
   * @param filename is the name of the file that will be created
   * @param text is the json that goes into the file
   */

  public download(filename, text) {
    var element = document.createElement('a');

    element.setAttribute('href', 'data:json/plain;charset=utf-8,' + escape(text));
    element.setAttribute('download', filename);

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
  }

  /**
   * Extracts the data from the parameter into an array of nodes
   * @param data is the node data that has to be extracted
   * @returns the array of nodes
   */

  //TODO make sure that the data is correct
  public checkThatImportDataIsValid(data: any): boolean {
    this.checkDataHasCorrectFormat(data);
    this.checkDataNodesAndEdgesAddUp(data);
    return true;
  }

  checkDataNodesAndEdgesAddUp(data: ImportData) {
    let nodeList = data.nodes.map((node) => {
      return node.id;
    });
    data.edges.forEach((edge) => {
      if (!nodeList.includes(edge.from)) {
        throw new Error();
      }
      if (!nodeList.includes(edge.to)) {
        throw new Error();
      }
    });
  }

  private checkDataHasCorrectFormat(data: any): void {
    if (!data.nodes) {
      throw new Error();
    }
    if (!data.edges) {
      throw new Error();
    }
    for (let key in data) {
      if (!['nodes', 'edges'].includes(key)) {
        throw Error();
      }
    }
    if (!Array.isArray(data.nodes)) {
      throw new Error();
    }
    if (!Array.isArray(data.edges)) {
      throw new Error();
    }
    for (let entry of data.nodes) {
      this.checkNodesHasCorrectFormat(entry);
    }
    for (let entry of data.edges) {
      this.checkEdgesHasCorrectFormat(entry);
    }
  }

  //TODO: check if attributes match the ones defined in vis.js
  private checkNodesHasCorrectFormat(entry): void {
    if (!entry.id && typeof entry.id !== 'string') {
      throw new Error();
    }
    if (!entry.label && typeof entry.id !== 'string') {
      throw new Error();
    }
    if (!entry.x && typeof entry.x !== 'number') {
      throw new Error();
    }
    if (!entry.y && typeof entry.y !== 'number') {
      throw new Error();
    }
  }

  //TODO: check if attributes match the ones defined in vis.js
  private checkEdgesHasCorrectFormat(entry): void {
    if (!entry.id && typeof entry.id !== 'string') {
      throw new Error();
    }
    if (!entry.from && typeof entry.from !== 'string') {
      throw new Error();
    }
    if (!entry.to && typeof entry.to !== 'string') {
      throw new Error();
    }
  }

  //TODO make method shorter
  public async upload(file: File) {
    return new Promise((resolve, reject) => {
      if (file.type != 'application/json') {
        reject('The file type is not JSON');
      }
      if (file['Size'] > 1e5) {
        reject('The file size is too large');
      }
      const reader = new FileReader();
      var importedJson;
      var service = new ImportExportService;
      reader.readAsBinaryString(file);

      reader.onload = function(e) {
        importedJson = e.target.result;
        let result = importedJson.split('%uD').join('\\uD');
        const parsedImportedJson = JSON.parse(result);
        service.checkThatImportDataIsValid(parsedImportedJson);
        resolve(parsedImportedJson);
      };
    });
  }

  public async uploadLogo(file: File) {
    return new Promise ((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      
      reader.onload = function(e) {
        resolve(e.target.result);
      }
    })
  }

  public convertNetworkToJSON(nodes: DataSetNodes, edges: DataSetEdges): string {
    return '{"nodes":[NODES],"edges":[EDGES]}'
      .replace('NODES', this.datasetToJSON(nodes))
      .replace('EDGES', this.datasetToJSON(edges));
  }

  private datasetToJSON(data: DataSetNodes | DataSetEdges): string {
    if (data.length === 0) {
      return '';
    }
    return data.getIds().map((id: IdType) => {
      return JSON.stringify(data.get(id))
    }).join(',');
  }
}
