import { TestBed } from '@angular/core/testing';

import { PopUpGeometryService } from './pop-up-geometry-service.service';

describe('PopUpGeometryServiceService', () => {
  let service: PopUpGeometryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PopUpGeometryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
