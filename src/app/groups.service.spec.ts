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

  it('should initialize with group1, group2, group3', () => {
    var groupsName = service.getGroupsName()
    var jsonGroup = JSON.stringify(service.getGroups())
    expect(groupsName).toEqual(["none", "group1", "group2", "group3"])
    expect(jsonGroup).toBe('{"group1":{"color":"red"},"group2":{"color":"green"},"group3":{"color":"yellow"}}')
  });

  it('should add a group', () => {
    service.addGroup("group4", "red")
    var groupsName = service.getGroupsName()
    var jsonGroup = JSON.stringify(service.getGroups())
    expect(groupsName).toEqual(["none", "group1", "group2", "group3", "group4"])
    expect(jsonGroup).toBe('{"group1":{"color":"red"},"group2":{"color":"green"},"group3":{"color":"yellow"},"group4":{"color":"red"}}')
  });

  
});
