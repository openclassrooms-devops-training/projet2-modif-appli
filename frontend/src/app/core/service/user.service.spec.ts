import { TestBed } from '@angular/core/testing';

import { UserService } from './user.service';
import {provideHttpClient} from '@angular/common/http';

describe('UserService', () => {
  let service: UserService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
      ]
    });
    service = TestBed.inject(UserService);
  });

  it('should be created', () => {
    // Arrange & Act: the service is instantiated in beforeEach via DI

    // Assert
    expect(service).toBeTruthy();
  });
});
