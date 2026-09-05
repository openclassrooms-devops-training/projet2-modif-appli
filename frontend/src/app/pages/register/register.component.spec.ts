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
    // Assert: the component was created successfully in beforeEach
    expect(component).toBeTruthy();
  });

  it('exposes the reactive form controls via the form getter', () => {
    // Assert
    expect(component.form).toBe(component.registerForm.controls);
  });

  it('does not submit an invalid form', () => {
    // Arrange: form is left empty (invalid)

    // Act
    component.onSubmit();

    // Assert
    expect(component.submitted).toBe(true);
    expect(userServiceMock.register).not.toHaveBeenCalled();
  });

  it('resets the form and its state via onReset()', () => {
    // Arrange
    component.registerForm.setValue({
      firstName: 'Alice', lastName: 'Martin', login: 'alice', password: 'password'
    });
    component.onSubmit();
    component.registrationSuccess = true;
    component.errorMessage = 'Impossible';

    // Act
    component.onReset();

    // Assert
    expect(component.submitted).toBe(false);
    expect(component.registrationSuccess).toBe(false);
    expect(component.errorMessage).toBe('');
    expect(component.registerForm.pristine).toBe(true);
  });

  it('navigates to login via goToLogin()', () => {
    // Arrange
    const navigateSpy = jest.spyOn(TestBed.inject(Router), 'navigate');

    // Act
    component.goToLogin();

    // Assert
    expect(navigateSpy).toHaveBeenCalledWith(['/login']);
  });

  it('confirms a successful registration and redirects to login', () => {
    // Arrange
    const navigateSpy = jest.spyOn(TestBed.inject(Router), 'navigate');
    component.registerForm.setValue({
      firstName: 'Alice',
      lastName: 'Martin',
      login: 'alice',
      password: 'password'
    });

    // Act
    component.onSubmit();

    // Assert
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
    // Arrange
    userServiceMock.register.mockReturnValue(throwError(() => new Error('network')));
    component.registerForm.setValue({
      firstName: 'Alice',
      lastName: 'Martin',
      login: 'alice',
      password: 'password'
    });

    // Act
    component.onSubmit();

    // Assert
    expect(component.errorMessage).toContain('Impossible');
    expect(component.registrationSuccess).toBe(false);
  });
});
