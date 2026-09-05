import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { of } from 'rxjs';

import { AppComponent } from './app.component';
import { UserService } from './core/service/user.service';

const userServiceMock = {
  getProfile: jest.fn()
};

describe('AppComponent', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    localStorage.clear();
    userServiceMock.getProfile.mockReturnValue(of({ firstName: 'Alice', lastName: 'Martin', login: 'alice' }));

    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [
        provideRouter([]),
        { provide: UserService, useValue: userServiceMock }
      ],
    }).compileComponents();
  });

  it('should create the app', () => {
    // Act
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;

    // Assert
    expect(app).toBeTruthy();
  });

  it(`should have the 'etudiant-frontend' title`, () => {
    // Act
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;

    // Assert
    expect(app.title).toEqual('etudiant-frontend');
  });

  it('does not fetch the profile when no user is authenticated', () => {
    // Arrange: no token in localStorage (cleared in beforeEach)

    // Act
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();

    // Assert
    expect(userServiceMock.getProfile).not.toHaveBeenCalled();
    expect(fixture.componentInstance.currentUser).toBeNull();
  });

  it('loads the profile and exposes initials when a token is present', () => {
    // Arrange
    localStorage.setItem('authToken', 'jwt-token');

    // Act
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();

    // Assert
    expect(userServiceMock.getProfile).toHaveBeenCalledTimes(1);
    expect(fixture.componentInstance.userInitials).toBe('AM');
  });

  it('uppercases the initials even when the profile names are lowercase', () => {
    // Arrange
    userServiceMock.getProfile.mockReturnValue(of({ firstName: 'raphael', lastName: 'girard', login: 'rg' }));
    localStorage.setItem('authToken', 'jwt-token');

    // Act
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();

    // Assert
    expect(fixture.componentInstance.userInitials).toBe('RG');
  });

  it('clears the current user on logout', () => {
    // Arrange
    localStorage.setItem('authToken', 'jwt-token');
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const navigateSpy = jest.spyOn(TestBed.inject(Router), 'navigate');

    // Act
    fixture.componentInstance.logout();

    // Assert
    expect(fixture.componentInstance.currentUser).toBeNull();
    expect(localStorage.getItem('authToken')).toBeNull();
    expect(navigateSpy).toHaveBeenCalledWith(['/login']);
  });
});
