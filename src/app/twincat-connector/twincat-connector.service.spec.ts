import { TestBed } from '@angular/core/testing';

import { TwincatConnectorService } from './twincat-connector.service';

describe('TwincatConnectorService', () => {
  let service: TwincatConnectorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TwincatConnectorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
