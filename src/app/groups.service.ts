import {Injectable} from '@angular/core';
import {Group} from './interfaces/Group';

/**
 * Service description hash table
 */

@Injectable({
  providedIn: 'root'
})
export class GroupsService {

  constructor() {
  }

  private groups: Group[] = [
    {name: 'ethical',       color: '#6370ff',   visJsName: 'group0'},
    {name: 'unethical',     color: '#fcba03', visJsName: 'group1'},
    {name: 'sustainable',   color: '#51cf55',  visJsName: 'group2'},
    {name: 'unsustainable', color: '#e8513a',    visJsName: 'group3'}
  ]

  public addGroup(nameOfGroup: string, colorOfGroup: string) {
    this.groups.push({name: nameOfGroup, color: colorOfGroup, visJsName: 'group' + this.numberOfGroups()});
  }

  /**
   * Checks if there is a group with the given name
   * @param groupName to search in the list of the current groups
   * @returns true if it finds a group with the given name, false otherwise
   */
  public doesGroupExist(groupName: string) : boolean {
    return this.groups.map((g: Group) => {return g.name}).includes(groupName);
  }

  public getGroups(defaultColor: string) {
    let temp: string[] = this.groups.map((g:Group) => {return '\"' + g.visJsName + '\" : { \"color\" : \"' + g.color + '\"}'})
    temp.splice(0,0, '\"none\" : { \"color\" : \"' + defaultColor + '\"}')
    return JSON.parse('{' + temp.toString() + '}');
  }

  private numberOfGroups() {
    return this.groups.length;
  }

  /**
   * Gives the list of groups
   * @returns list of the name of the groups
   */
  public getGroupsName() : string[] {
    let out: string[] = this.groups.map((g:Group) => {return g.name;});
    out.splice(0,0,'none');
    return out;
  }

  /**
   * Returns the visJsName of a group
   * @param groupName whose visJsName we are looking fore
   * @returns the visJsName if he finds it
   */
  public findVisJsName(groupName: string) {
    if (groupName === "none") return "none";
    return this.groups.find((g:Group) => {return g.name === groupName;}).visJsName;
  }

  public setGroups(groups: Group[]) {
    for (let i = 0; i < groups.length; i++) groups[i].visJsName = 'group' + i;
    this.groups = groups;
  }

  public setGroupColor(name: string, color: string) {
    this.groups.find((g:Group) => {return g.name === name;}).color = color;
  }

  public getRawGroups() : Group[] {
    return this.groups;
  }

  public getGroupColor(name: string, defaultColor: string) : string {
    if (name === "none") return defaultColor;
    return this.groups.find((g:Group) => {return g.name === name;}).color;
  }
}
