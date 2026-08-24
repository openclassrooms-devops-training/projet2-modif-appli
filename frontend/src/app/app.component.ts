import { Component, inject, isDevMode } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { AuthService } from './core/service/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  imports: [
    RouterLink,
    RouterOutlet
  ],
  styleUrl: './app.component.css'
})
export class AppComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly isDevelopment = isDevMode();
  title = 'etudiant-frontend';

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
