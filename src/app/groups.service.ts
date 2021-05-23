import {Injectable} from '@angular/core';

/**
 * description service group getters and various exports
 */
export class group {

  constructor(name: string, color: string, visJsName: string) {
    this.name = name;
    this.color = color;
    this.visJsName = visJsName;
  }

  private name: string;
  private color: string;
  private visJsName: string;

  public getName() {
    return this.name;
  }

  public getColor() {
    return this.color;
  }

  public getVisJsName() {
    return this.visJsName;
  }

  public setName(name: string) {
    this.name = name;
  }

  public setColor(color: string) {
    this.color = color;
  }

  public setVisJsName(visJsName: string) {
    this.visJsName = visJsName;
  }

  public toString() {
    return '"' + this.visJsName + '" : { "color" : "' + this.color + '" }';
  }
}

/**
 * Service description hash table
 */

@Injectable({
  providedIn: 'root'
})
export class GroupsService {

  constructor() {
  }

  private nameOfGroups: string[] = ['none', 'ethical', 'unethical', 'sustainable', 'unsustainable'];
  private groups: group[] = [new group('ethical', 'blue', 'group1'), new group('unethical', 'orange', 'group2'),
    new group('sustainable', 'green', 'group3'), new group('unsustainable', 'red', 'group4')];

  public addGroup(nameOfGroup: string, colorOfGroup: string) {
    this.groups.push(new group(nameOfGroup, colorOfGroup, 'group' + this.numberOfGroups()));
    this.nameOfGroups.push(nameOfGroup);
  }

  public checkGroupName(groupName: string) {
    for (var group of this.groups) {
      if (group.getName() == groupName) {
        return true;
      }
    }
    return false;
  }

  public getGroups() {

    var temp: string = '{';

    temp += this.groups.toString();
    temp += '}';
    console.log(temp);
    return JSON.parse(temp);
  }

  private numberOfGroups() {
    return this.nameOfGroups.length;
  }

  public getGroupsName() {
    return this.nameOfGroups;
  }

  public findVisJsName(groupName: string) {
    if (groupName === "none") return "none";
    for (var group of this.groups) {
      if (group.getName() == groupName) {
        return group.getVisJsName()
      }
    }
  }

}
