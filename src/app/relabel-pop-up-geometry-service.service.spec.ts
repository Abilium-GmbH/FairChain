import {TestBed} from '@angular/core/testing';

import {RelabelPopUpGeometryService} from './relabel-pop-up-geometry-service.service';

describe('RelabelPopUpGeometryServiceService', () => {
  let service: RelabelPopUpGeometryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RelabelPopUpGeometryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
