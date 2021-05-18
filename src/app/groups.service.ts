import { Injectable } from '@angular/core';

export class group{

  constructor(name:string, color:string) { 
    this.name = name;
    this.color = color;
  }
  private name:string;
  private color:string;
  public getName(){ return this.name}
  public getColor(){ return this.color}
  
  public setName(name:string){this.name = name}
  public setColor(color:string){this.color=color}
  public toString(){
    return '"' + this.name.trim() + '" : { "color" : "' + this.color + '" }'
  }
}

@Injectable({
  providedIn: 'root'
})
export class GroupsService {

  constructor() { }
  private nameOfGroups: string[]=["none","ethical", "unethical", "sustainable", "unsustainable"]
  private groups:group[] =[ new group("ethical","blue"), new group("unethical","orange"), new group("sustainable","green"), new group("unsustainable","red")]

  public addGroup(nameOfGroup:string, colorOfGroup:string) {
    //for (var currentName in this.nameOfGroups){if (currentName.toLowerCase() === nameOfGroup.toLowerCase()){throw new Error("I should show up")}}
    this.groups.push(new group (nameOfGroup, colorOfGroup))
    this.nameOfGroups.push(nameOfGroup)
  }

  public getGroups(){
    
    var temp:string='{';
    //for(var group of this.groups){ temp+=temp+'"GROUPNAME":{ "color": "COLOR"}, ';temp.replace('GROUPNAME', group.getName()).replace('COLOR',group.getColor());}
    
    temp+=this.groups.toString()
    temp += '}';
    console.log(temp)
    return JSON.parse(temp);
  }

  public getGroupsName(){
    return this.nameOfGroups;
  }
  
}
