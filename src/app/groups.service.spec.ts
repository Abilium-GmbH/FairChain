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
    expect(service.getGroupsName()).toBe(["group1", "group2", "group3"])
  });

  it('should add a group', () => {
    service.addGroup()
    expect(service.getGroupsName()).toBe(["group1", "group2", "group3", "group4"])
  });

  it('should add a group', () => {
    service.addGroup()
    expect(service.getGroupsName()).toBe(["group1", "group2", "group3", "group4"])
  });
});
