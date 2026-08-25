import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegisterComponent } from './register.component';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { UserService } from '../../core/service/user.service';

const userServiceMock = {
  register: jest.fn()
};

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;

  beforeEach(async () => {
    jest.clearAllMocks();
    userServiceMock.register.mockReturnValue(of(void 0));
    await TestBed.configureTestingModule({
      imports: [RegisterComponent],
      providers: [
        provideHttpClient(),
        provideRouter([]),
        { provide: UserService, useValue: userServiceMock },
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('confirms a successful registration and redirects to login', () => {
    const navigateSpy = jest.spyOn(TestBed.inject(Router), 'navigate');
    component.registerForm.setValue({
      firstName: 'Alice',
      lastName: 'Martin',
      login: 'alice',
      password: 'password'
    });

    component.onSubmit();

    expect(userServiceMock.register).toHaveBeenCalledWith({
      firstName: 'Alice',
      lastName: 'Martin',
      login: 'alice',
      password: 'password'
    });
    expect(component.registrationSuccess).toBe(true);
    expect(navigateSpy).not.toHaveBeenCalled();
  });

  it('displays an error when registration fails', () => {
    userServiceMock.register.mockReturnValue(throwError(() => new Error('network')));
    component.registerForm.setValue({
      firstName: 'Alice',
      lastName: 'Martin',
      login: 'alice',
      password: 'password'
    });

    component.onSubmit();

    expect(component.errorMessage).toContain('Impossible');
    expect(component.registrationSuccess).toBe(false);
  });
});
