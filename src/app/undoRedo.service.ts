import {Injectable} from '@angular/core';
import {DataSetNodes, DataSetEdges} from 'vis-network/peer/esm/vis-network';
import {ImportExportService} from './importExport.service';
import {Group} from './interfaces/Group';

@Injectable({
  providedIn: 'root'
})

/**
 * Handles everything with the snapshots
 * Remembers predecessor and successor networks in the snapshots variable
 * The counter variable specifies on which version of the graph the user currently is
 */
export class UndoRedoService {

  private counter = 0;
  private snapshots = [];

  /**
   * Pushes an empty network into the snapshots array when the object is constructed
   * @param importExportService
   */
  constructor(private importExportService: ImportExportService) {
    this.snapshots.push('{"nodes":[],"edges":[],"metadata":""}');
  }

  /**
   * Gets the parsed predecessor snapshot
   * Lowers the counter by 1
   * If the counter is at zero, this method returns the empty graph
   * @returns the parsed version of the snapshot that is stored before the current network
   */
  public getPredecessorSnapshot(): JSON {
    if (this.counter > 0) {
      this.counter--;
    }
    return JSON.parse(this.snapshots[this.counter]);
  }

  /**
   * Gets the parsed successor snapshot
   * Increases the counter
   * @returns the parsed version of the snapshot that is stored after the current network
   */
  public getSuccessorSnapshot(): JSON {
    if (this.counter < this.snapshots.length - 1) {
      this.counter++;
    }
    return JSON.parse(this.snapshots[this.counter]);
  }

  /**
   * Is called every time the user has changed something in the graph
   * Checks that the snapshot array isn't longer than the counter + 1
   * Removes excess snapshots if this is the case
   * Increases the counter
   * Adds a new snapshot in the snapshot array with the JSON that the importExportService provides
   * @param nodes are the nodes that have to be used as parameters in this snapshot
   * @param edges are the edges that have to be used as parameters in this snapshot
   * @param metadata is the metadata that has to be used as parameters in this snapshot
   */
  public addSnapshot(nodes: DataSetNodes, edges: DataSetEdges, metadata: string, groups: Group[]) {
    if (this.counter + 1 < this.snapshots.length) {
      this.snapshots.splice(this.counter + 1, this.snapshots.length);
    }
    this.counter++;
    this.snapshots[this.counter] = this.importExportService.convertNetworkToJSON(nodes, edges, metadata, groups);
  }
}
