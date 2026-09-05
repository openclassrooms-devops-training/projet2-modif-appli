import { TestBed } from '@angular/core/testing';

import { UserService } from './user.service';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';

describe('UserService', () => {
  let service: UserService;
  let httpController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    service = TestBed.inject(UserService);
    httpController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpController.verify());

  it('should be created', () => {
    // Arrange & Act: the service is instantiated in beforeEach via DI

    // Assert
    expect(service).toBeTruthy();
  });

  it('registers a new agent', () => {
    // Arrange
    const registerUser = { firstName: 'Alice', lastName: 'Martin', login: 'alice', password: 'password' };

    // Act
    service.register(registerUser).subscribe();

    // Assert
    const request = httpController.expectOne('/api/register');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(registerUser);
    request.flush({});
  });

  it('logs in and returns the raw JWT token', () => {
    // Arrange
    const loginUser = { login: 'alice', password: 'password' };

    // Act
    service.login(loginUser).subscribe((token) => expect(token).toBe('jwt-token'));

    // Assert
    const request = httpController.expectOne('/api/login');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(loginUser);
    request.flush('jwt-token');
  });

  it('fetches the authenticated agent profile', () => {
    // Arrange
    const profile = { firstName: 'Alice', lastName: 'Martin', login: 'alice' };

    // Act
    service.getProfile().subscribe((result) => expect(result).toEqual(profile));

    // Assert
    const request = httpController.expectOne('/api/me');
    expect(request.request.method).toBe('GET');
    request.flush(profile);
  });
});
