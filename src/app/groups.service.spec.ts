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

  it('should initialize with none, ethical, unethical, sustainable, unsustainable', () => {
    var groupsName = service.getGroupsName()
    var jsonGroup = JSON.stringify(service.getGroups('#73c2fb'))
    expect(groupsName).toEqual(["none", "ethical", "unethical", "sustainable","unsustainable"])
    expect(jsonGroup).toBe('{"none":{"color":"#73c2fb"},"group0":{"color":"#6370ff"},"group1":{"color":"#fcba03"},"group2":{"color":"#51cf55"},"group3":{"color":"#e8513a"}}')
  });

  it('should add a group', () => {
    service.addGroup("new group", "red")
    var groupsName = service.getGroupsName()
    var jsonGroup = JSON.stringify(service.getGroups('#73c2fb'))
    expect(groupsName).toEqual(["none", "ethical", "unethical", "sustainable","unsustainable", "new group"])
    expect(jsonGroup).toBe('{"none":{"color":"#73c2fb"},"group0":{"color":"#6370ff"},"group1":{"color":"#fcba03"},"group2":{"color":"#51cf55"},"group3":{"color":"#e8513a"},"group4":{"color":"red"}}')
  });


});
