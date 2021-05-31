import { Injectable } from '@angular/core';

/**
 * description service group getters and various exports
 */
export class group {

  private color: string;
  private name: string;
  private visJsName: string;


  constructor(name: string, color: string, visJsName: string) {
    this.name = name;
    this.color = color;
    this.visJsName = visJsName;
  }

  public getColor() {
    return this.color;
  }

  public getName() {
    return this.name;
  }

  public getVisJsName() {
    return this.visJsName;
  }

  public setColor(color: string) {
    this.color = color;
  }

  public setName(name: string) {
    this.name = name;
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

  private groups: group[] = [new group('ethical', 'blue', 'group1'), new group('unethical', 'orange', 'group2'),
  new group('sustainable', 'green', 'group3'), new group('unsustainable', 'red', 'group4')];
  private nameOfGroups: string[] = ['none', 'ethical', 'unethical', 'sustainable', 'unsustainable'];


  constructor() {
  }

  public addGroup(nameOfGroup: string, colorOfGroup: string): void {
    this.groups.push(new group(nameOfGroup, colorOfGroup, 'group' + this.numberOfGroups()));
    this.nameOfGroups.push(nameOfGroup);
  }

  public checkGroupName(groupName: string): boolean {
    for (var group of this.groups) {
      if (group.getName() == groupName) {
        return true;
      }
    }
    return false;
  }

  public findVisJsName(groupName: string): string {
    if (groupName === "none") return "none";
    for (var group of this.groups) {
      if (group.getName() == groupName) {
        return group.getVisJsName()
      }
    }
  }

  public getGroups(): JSON {
    var temp: string = '{';

    temp += this.groups.toString();
    temp += '}';
    console.log(temp);
    return JSON.parse(temp);
  }

  public getGroupsName(): string[] {
    return this.nameOfGroups;
  }


  private numberOfGroups(): number {
    return this.nameOfGroups.length;
  }
}
