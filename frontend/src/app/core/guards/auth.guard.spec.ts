import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';

import { authGuard } from './auth.guard';
import { AuthService } from '../service/auth.service';

describe('authGuard', () => {
  let authService: AuthService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    authService = TestBed.inject(AuthService);
  });

  it('allows access when a token exists', () => {
    // Arrange
    localStorage.setItem('authToken', 'jwt-token');

    // Act
    const result = TestBed.runInInjectionContext(() => authGuard({} as never, {} as never));

    // Assert
    expect(result).toBe(true);
  });

  it('returns a login UrlTree when no token exists', () => {
    // Arrange: no token in localStorage (cleared in beforeEach)

    // Act
    const result = TestBed.runInInjectionContext(() => authGuard({} as never, {} as never));

    // Assert
    expect(result).toEqual(TestBed.inject(Router).createUrlTree(['/login']));
  });
});
