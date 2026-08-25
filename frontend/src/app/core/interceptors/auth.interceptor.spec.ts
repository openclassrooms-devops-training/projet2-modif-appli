import { HttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';

import { authInterceptor } from './auth.interceptor';

describe('authInterceptor', () => {
  let httpClient: HttpClient;
  let httpController: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting()
      ]
    });
    httpClient = TestBed.inject(HttpClient);
    httpController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpController.verify());

  it('adds the bearer token to API requests', () => {
    localStorage.setItem('authToken', 'jwt-token');

    httpClient.get('/api/students').subscribe();

    const request = httpController.expectOne('/api/students');
    expect(request.request.headers.get('Authorization')).toBe('Bearer jwt-token');
    request.flush([]);
  });

  it('does not add a token when the user is not authenticated', () => {
    httpClient.get('/api/students').subscribe();

    const request = httpController.expectOne('/api/students');
    expect(request.request.headers.has('Authorization')).toBe(false);
    request.flush([]);
  });
});
