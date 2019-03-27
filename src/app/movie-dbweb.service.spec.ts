import { TestBed } from '@angular/core/testing';

import { MovieDBWebService } from './movie-dbweb.service';

describe('MovieDBWebService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: MovieDBWebService = TestBed.get(MovieDBWebService);
    expect(service).toBeTruthy();
  });
});
