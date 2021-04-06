import { Injectable } from '@angular/core';
import * as vis from 'vis-network';
import * as visData from 'vis-data';
import { network } from 'vis-network';

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
    
    public download(filename, text) {
      var element = document.createElement('a');
      element.setAttribute('href', 'data:json/plain;charset=utf-8,' + encodeURIComponent(text));
      element.setAttribute('download', filename);
    
      element.style.display = 'none';
      document.body.appendChild(element);
    
      element.click();
    
      document.body.removeChild(element);
    }

    public overwriteData(parsedImportedJson:JSON){
      this.data = {
        nodes: getNodeData(parsedImportedJson),
        edges: getEdgeData(parsedImportedJson)
      };
      function getNodeData(data) {
        var networkNodes = [];
      
        data.forEach(function (elem, index, array) {
          networkNodes.push({
            id: elem.id,
            label: elem.label,
            x: elem.x,
            y: elem.y,
          });
        });
      
        return new visData.DataSet(networkNodes);
      }

      function getEdgeData(data) {
        var networkEdges = [];
      
        data.forEach(function (elem) {
            networkEdges.push({ from: elem.from, to: elem.to, id: elem.id  });
        });
      
        return new visData.DataSet(networkEdges);
      }
    }
    
    public getData(){
      return this.data;
    }
    
}