import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter, Router } from '@angular/router';
import { of, throwError } from 'rxjs';

import { LoginComponent } from './login.component';
import { UserService } from '../../core/service/user.service';

const userServiceMock = {
  login: jest.fn()
};

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;

  beforeEach(async () => {
    userServiceMock.login.mockReset();
    localStorage.clear();

    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        provideHttpClient(),
        provideRouter([]),
        { provide: UserService, useValue: userServiceMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('exposes the reactive form controls via the form getter', () => {
    // Assert
    expect(component.form).toBe(component.loginForm.controls);
  });

  it('resets the form and its state via onReset()', () => {
    // Arrange
    component.loginForm.setValue({ login: 'alice', password: 'password' });
    component.submitted = true;
    component.errorMessage = 'Identifiants incorrects.';
    component.successMessage = 'ok';

    // Act
    component.onReset();

    // Assert
    expect(component.submitted).toBe(false);
    expect(component.loading).toBe(false);
    expect(component.errorMessage).toBe('');
    expect(component.successMessage).toBe('');
    expect(component.loginForm.pristine).toBe(true);
  });

  it('should display validation errors for an empty form', () => {
    // Arrange: form is left empty (default state after creation)

    // Act
    component.onSubmit();

    // Assert
    expect(component.submitted).toBe(true);
    expect(component.loginForm.invalid).toBe(true);
    expect(userServiceMock.login).not.toHaveBeenCalled();
  });

  it('should store the token and redirect after a successful login', () => {
    // Arrange
    userServiceMock.login.mockReturnValue(of('jwt-token'));
    const navigateSpy = jest.spyOn(TestBed.inject(Router), 'navigate');
    component.loginForm.setValue({ login: 'alice', password: 'password' });

    // Act
    component.onSubmit();

    // Assert
    expect(userServiceMock.login).toHaveBeenCalledWith({ login: 'alice', password: 'password' });
    expect(localStorage.getItem('authToken')).toBe('jwt-token');
    expect(navigateSpy).toHaveBeenCalledWith(['/students']);
    expect(component.loading).toBe(false);
  });

  it('should display an error after an unauthorized login', () => {
    // Arrange
    userServiceMock.login.mockReturnValue(throwError(() => ({ status: 401 })));
    component.loginForm.setValue({ login: 'alice', password: 'wrong-password' });

    // Act
    component.onSubmit();

    // Assert
    expect(component.errorMessage).toBe('Identifiants incorrects.');
    expect(localStorage.getItem('authToken')).toBeNull();
    expect(component.loading).toBe(false);
  });
});
