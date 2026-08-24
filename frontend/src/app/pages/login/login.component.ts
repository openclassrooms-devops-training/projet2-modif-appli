import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MaterialModule } from '../../shared/material.module';
import { Login } from '../../core/models/Login';
import { UserService } from '../../core/service/user.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [CommonModule, MaterialModule],
  templateUrl: './login.component.html',
  standalone: true,
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {
  private readonly userService = inject(UserService);
  private readonly formBuilder = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);
  private readonly router = inject(Router);

  loginForm: FormGroup = new FormGroup({});
  submitted = false;
  loading = false;
  errorMessage = '';
  successMessage = '';

  ngOnInit(): void {
    this.loginForm = this.formBuilder.group({
      login: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  get form() {
    return this.loginForm.controls;
  }

  onSubmit(): void {
    this.submitted = true;
    this.errorMessage = '';
    this.successMessage = '';

    if (this.loginForm.invalid) {
      return;
    }

    const loginRequest: Login = {
      login: this.loginForm.get('login')?.value,
      password: this.loginForm.get('password')?.value
    };

    this.loading = true;
    this.userService.login(loginRequest)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (token) => {
          localStorage.setItem('authToken', token);
          this.loading = false;
          this.router.navigate(['/students']);
        },
        error: (error: HttpErrorResponse) => {
          this.loading = false;
          this.errorMessage = error.status === 401
            ? 'Identifiants incorrects.'
            : 'Une erreur est survenue. Veuillez réessayer.';
        }
      });
  }

  onReset(): void {
    this.submitted = false;
    this.loading = false;
    this.errorMessage = '';
    this.successMessage = '';
    this.loginForm.reset();
  }
}
