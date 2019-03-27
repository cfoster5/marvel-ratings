import { TestBed } from '@angular/core/testing';

import { MovieDBService } from './movie-db.service';

describe('MovieDBService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: MovieDBService = TestBed.get(MovieDBService);
    expect(service).toBeTruthy();
  });
});
