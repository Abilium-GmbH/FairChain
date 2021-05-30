import { TestBed } from '@angular/core/testing';

import { GroupsService } from './groups.service';

describe('GroupsService', () => {
  let service: GroupsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GroupsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initialize with ethical, group2, group3', () => {
    var groupsName = service.getGroupsName()
    var jsonGroup = JSON.stringify(service.getGroups())
    expect(groupsName).toEqual(["none", "ethical", "unethical", "sustainable","unsustainable"])
    expect(jsonGroup).toBe('{"group1":{"color":"blue"},"group2":{"color":"orange"},"group3":{"color":"green"},"group4":{"color":"red"}}')
  });

  it('should add a group', () => {
    service.addGroup("new group", "red")
    var groupsName = service.getGroupsName()
    var jsonGroup = JSON.stringify(service.getGroups())
    expect(groupsName).toEqual(["none", "ethical", "unethical", "sustainable","unsustainable", "new group"])
    expect(jsonGroup).toBe('{"group1":{"color":"blue"},"group2":{"color":"orange"},"group3":{"color":"green"},"group4":{"color":"red"},"group5":{"color":"red"}}')
  });

  
});
