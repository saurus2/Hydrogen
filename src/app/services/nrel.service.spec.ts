import { TestBed } from '@angular/core/testing';

import { NrelService } from './nrel.service';

describe('NrelService', () => {
  let service: NrelService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NrelService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
