import {TestBed} from '@angular/core/testing';

import {RelabelPopUpGeometryServiceService} from './relabel-pop-up-geometry-service.service';

describe('RelabelPopUpGeometryServiceService', () => {
  let service: RelabelPopUpGeometryServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RelabelPopUpGeometryServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
