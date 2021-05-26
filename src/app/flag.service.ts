import {Injectable} from '@angular/core';
import {emojis as flags} from './emojis';

@Injectable({
  providedIn: 'root'
})
export class FlagService {

  public currentFlag = '';

  public addOrChangeFlag(nodeLabel: string, nodeFlag: string) {
    if (nodeFlag === '') {
      return nodeLabel;
    }
    ;
    nodeLabel = this.removeFlagFromLabel(nodeLabel);
    return nodeFlag + '\n' + nodeLabel;
  }

  public removeFlagFromLabel(label: string) {
    if (label === undefined) {
      return label;
    }
    if (flags.some(v => label.includes(v))) {
      label = label.slice(5);
    }
    return label;
  }

  public changeLabelWithoutChangingFlag(originalLabel: string, newLabel: string) {
    if (originalLabel === undefined) {
      return newLabel;
    }
    if (flags.some(v => originalLabel.includes(v))) {
      newLabel = originalLabel.slice(0, 5) + newLabel;
    }
    return newLabel;
  }

  public saveFlagFromLabel(label: string) {
    if (label === undefined) {
      this.currentFlag = '';
    } else {
      if (flags.some(v => label.includes(v))) {
        this.currentFlag = label.slice(0, 4);
      } else {
        this.currentFlag = '';
      }
    }
  }
}
