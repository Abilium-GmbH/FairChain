import { Injectable } from '@angular/core';
import { ImportData } from './interfaces/importData'
import { DataSetNodes, DataSetEdges, IdType} from "vis-network/peer/esm/vis-network";
import { Group } from './interfaces/Group';

@Injectable({
  providedIn: 'root'
})

/**
 * This component handles everything to do with importing and exporting the vis network as a JSON
 */
export class ImportExportService {
  /**
   * Is called in the upload method to check that the file we want to import is not a random file
   * @param data is the node data that has to be extracted
   * @returns a boolean confirming if we can import the data
   */
  public checkThatImportDataIsValid(data: any): boolean {
    this.checkDataHasCorrectFormat(data);
    this.checkDataNodesAndEdgesAddUp(data);
    return true;
  }

  /**
   * Creates a temporary, non-visible HTML element with a download function, clicks on it and removes it from the document
   * Gets called when the export button is pressed
   * @param filename is the name of the file that will be created
   * @param text is the json that goes into the file
   */
  public download(filename, text): void {
    var element = document.createElement('a');
    element.setAttribute('href', 'data:json/plain;charset=utf-8,' + escape(text));
    element.setAttribute('download', filename);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  }

  /**
   * An asynchronous method that returns a promise
   * Checks if the file is a JSON file
   * Rejects a file if it is too big
   * Reads the file as binary string
   * When the reader has read the file, it initiates a new variable importedJson, which is the JSON in the file
   * Replaces all "%" with a "\" so that the flags are read properly
   * Parses the json
   * Checks that the file that is imported is valid
   * Resolves the promise
   * @param file is the file that the user wants to upload
   * @returns a promise with a reader that resolves promise
   */
  public async upload(file: File): Promise<any> {
    return new Promise((resolve, reject) => {
      if (file.type != 'application/json') reject('The file type is not JSON');
      if (file['Size'] > 1e5) reject('The file size is too large');
      const reader = new FileReader();
      var importedJson;
      var service = new ImportExportService;
      reader.readAsBinaryString(file);

      reader.onload = function (e) {
        importedJson = e.target.result;
        let result = importedJson.split('%uD').join('\\uD');
        const parsedImportedJson = JSON.parse(result);
        service.checkThatImportDataIsValid(parsedImportedJson);
        resolve(parsedImportedJson);
      }
    })
  }

  /**
   * An asynchronous method that returns a promise
   * Uses FileReader to read the file that the method gets
   * The promise resolves with the image as base64
   * 
   * @param file is the image that should be turned into a base64 string
   * @returns a base64 string that represents the image
   */
  public async uploadLogo(file: File): Promise<any> {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);

      reader.onload = function (e) {
        resolve(e.target.result);
      }
    })
  }

  /**
   * Checks if the json that we parsed has nodes, edges and metadata subgroups
   * Also checks if there are arrays under nodes and edges
   * Calls other methods to check if the nodes and edges have the correct formats
   * @param data is the json that we got from the user
   */
  private checkDataHasCorrectFormat(data: any): void {
    if (!data.nodes) throw new Error();
    if (!data.edges) throw new Error();
    for (let key in data) if (!['nodes','edges','metadata', 'groups'].includes(key)) throw Error();
    if (!Array.isArray(data.nodes)) throw new Error();
    if (!Array.isArray(data.edges)) throw new Error();
    for (let entry of data.nodes) { this.checkNodesHasCorrectFormat(entry); }
    for (let entry of data.edges) { this.checkEdgesHasCorrectFormat(entry); }
  }

  /**
   * Is a helper method that is called in checkThatImportDataIsValid
   * Checks that the edges in the data have a from and a to 
   * @param data is the data of the edges and nodes that we want to check 
   */
  private checkDataNodesAndEdgesAddUp(data: ImportData): void {
    let nodeList = data.nodes.map((node) => { return node.id });
    data.edges.forEach((edge) => {
      if (!nodeList.includes(edge.from)) throw new Error();
      if (!nodeList.includes(edge.to)) throw new Error();
    })
  }

  /**
   * Checks that this edge has at least the minimal amount of parameters that a node should have
   * Is called from checkDataHasCorrectFormat()
   * @param entry is the individual edge that the method is checking
   */
  private checkEdgesHasCorrectFormat(entry): void {
    if (!entry.id && typeof entry.id !== 'string') throw new Error();
    if (!entry.from && typeof entry.from !== 'string') throw new Error();
    if (!entry.to && typeof entry.to !== 'string') throw new Error();
  }

  /**
   * This method is called from the fairchain component when the user clicks on export
   * Takes the relevant variables, converts them to JSON substrings and then adds them together
   * @param nodes is the nodes from the fairchain component that we have to make into a part of the JSON
   * @param edges is the edges from the fairchain component that we have to make into a part of the JSON
   * @param metadata is the metadata from the fairchain component that we have to make into a part of the JSON
   * @returns a String containing the JSON of the network
   */
  public convertNetworkToJSON(nodes: DataSetNodes, edges: DataSetEdges, metadata:string, groups: Group[]): string {
    return "{\"nodes\":[NODES],\"edges\":[EDGES],\"metadata\":METADATA,\"groups\":[GROUPS]}" 
      .replace('NODES', this.datasetToJSON(nodes))
      .replace('EDGES', this.datasetToJSON(edges))
      .replace('METADATA', JSON.stringify(metadata))
      .replace('GROUPS', this.groupsToJSON(groups));
  }

  /**
   * Checks that this node has at least the minimal amount of parameters that a node should have
   * Is called from checkDataHasCorrectFormat()
   * @param entry is the individual node that the method is checking
   */
  private checkNodesHasCorrectFormat(entry): void {
    if (!entry.id && typeof entry.id !== 'string') throw new Error();
    if (!entry.label && typeof entry.id !== 'string') throw new Error();
    if (!entry.x && typeof entry.x !== 'number') throw new Error();
    if (!entry.y && typeof entry.y !== 'number') throw new Error();
  }

  /**
   * Extracts the elements from the Dataset with their Ids and stringifys them
   * Is a helper method of convertNetworkToJSON
   * @param data is the DataSet 
   * @returns the data as JSON
   */
  private datasetToJSON(data: DataSetNodes | DataSetEdges): string {
    if (data.length === 0) return '';
    return data.getIds().map((id: IdType) => {
      return JSON.stringify(data.get(id))
    }).join(',');
  }

  /**
   * Extracts the elements from the Dataset with their Ids and stringifys them
   * Is a helper method of convertNetworkToJSON
   * @param data is the DataSet 
   * @returns the data as JSON
   */
   private groupsToJSON(data: Group[]): string {
    if (data.length === 0) return '[]';
    return data.map((g: Group) => {
      return JSON.stringify(g)
    }).join(',');
  }
}