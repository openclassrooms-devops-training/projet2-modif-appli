import { Component, DestroyRef, OnInit, inject, isDevMode } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterOutlet } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs';
import { AuthService } from './core/service/auth.service';
import { UserService } from './core/service/user.service';
import { UserProfile } from './core/models/UserProfile';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  imports: [
    RouterLink,
    RouterOutlet
  ],
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly userService = inject(UserService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  readonly isDevelopment = isDevMode();
  title = 'etudiant-frontend';
  currentUser: UserProfile | null = null;

  ngOnInit(): void {
    this.refreshCurrentUser();
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(() => this.refreshCurrentUser());
  }

  get userInitials(): string {
    if (!this.currentUser) {
      return '';
    }
    return `${this.currentUser.firstName.charAt(0)}${this.currentUser.lastName.charAt(0)}`.toUpperCase();
  }

  logout(): void {
    this.authService.logout();
    this.currentUser = null;
    this.router.navigate(['/login']);
  }

  private refreshCurrentUser(): void {
    if (!this.authService.isAuthenticated()) {
      this.currentUser = null;
      return;
    }
    if (this.currentUser) {
      return;
    }
    this.userService.getProfile()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (profile) => this.currentUser = profile,
        error: () => this.currentUser = null
      });
  }
}
