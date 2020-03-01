import { TestBed } from '@angular/core/testing';
import { TwincatConnectorService } from './twincat-connector.service';
//import { HttpClientTestingModule } from '@angular/common/http/testing';
//import { HttpClient } from '@angular/common/http';
import { TwincatClient } from '../logger-mock/logger-mock'
import { Logger } from '../logger-mock/logger-mock'

describe('TwincatConnectorService', () => {
  let service: TwincatConnectorService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        TwincatClient,
        Logger
      ],
    });
    service = TestBed.inject(TwincatConnectorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
