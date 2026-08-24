import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
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
        { provide: UserService, useValue: userServiceMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should display validation errors for an empty form', () => {
    component.onSubmit();

    expect(component.submitted).toBe(true);
    expect(component.loginForm.invalid).toBe(true);
    expect(userServiceMock.login).not.toHaveBeenCalled();
  });

  it('should store the token after a successful login', () => {
    userServiceMock.login.mockReturnValue(of('jwt-token'));
    component.loginForm.setValue({ login: 'alice', password: 'password' });

    component.onSubmit();

    expect(userServiceMock.login).toHaveBeenCalledWith({ login: 'alice', password: 'password' });
    expect(localStorage.getItem('authToken')).toBe('jwt-token');
    expect(component.successMessage).toBe('Connexion réussie.');
    expect(component.loading).toBe(false);
  });

  it('should display an error after an unauthorized login', () => {
    userServiceMock.login.mockReturnValue(throwError(() => ({ status: 401 })));
    component.loginForm.setValue({ login: 'alice', password: 'wrong-password' });

    component.onSubmit();

    expect(component.errorMessage).toBe('Identifiants incorrects.');
    expect(localStorage.getItem('authToken')).toBeNull();
    expect(component.loading).toBe(false);
  });
});
