import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="page">
      <div class="auth-container animate-in">
        <div class="auth-card">
          <div class="auth-header">
            <div class="auth-logo">▶</div>
            <h1>ÎNREGISTRARE</h1>
            <p>Creează un cont nou pentru a rezerva bilete</p>
          </div>

          <div class="auth-form">
            <div class="form-group">
              <label for="username">Nume utilizator</label>
              <input id="username" type="text" class="form-control" [(ngModel)]="username"
                     placeholder="numele_tău" (keyup.enter)="register()">
            </div>
            <div class="form-group">
              <label for="email">Email</label>
              <input id="email" type="email" class="form-control" [(ngModel)]="email"
                     placeholder="exemplu@mail.com" (keyup.enter)="register()">
            </div>
            <div class="form-group">
              <label for="password">Parolă</label>
              <input id="password" type="password" class="form-control" [(ngModel)]="password"
                     placeholder="••••••••" (keyup.enter)="register()">
            </div>

            @if (error) {
              <div class="error-msg">{{ error }}</div>
            }

            <button class="btn btn-primary btn-full" (click)="register()" [disabled]="loading">
              @if (loading) {
                <div class="spinner" style="width:18px;height:18px;border-width:2px"></div>
              } @else {
                Creează cont
              }
            </button>
          </div>

          <div class="auth-footer">
            <span>Ai deja cont?</span>
            <a routerLink="/login">Autentifică-te</a>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-container {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: calc(100vh - var(--navbar-height) - 60px);
    }
    .auth-card {
      width: 100%;
      max-width: 420px;
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: var(--radius-xl);
      padding: 48px 40px;
    }
    .auth-header {
      text-align: center;
      margin-bottom: 36px;
    }
    .auth-logo {
      width: 52px;
      height: 52px;
      background: var(--accent);
      color: var(--bg-primary);
      border-radius: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
      font-weight: 700;
      margin: 0 auto 18px;
    }
    .auth-header h1 {
      font-family: var(--font-display);
      font-size: 2rem;
      letter-spacing: 3px;
      margin-bottom: 6px;
    }
    .auth-header p {
      color: var(--text-muted);
      font-size: 0.88rem;
    }
    .error-msg {
      padding: 12px 16px;
      background: rgba(228, 64, 64, 0.1);
      border: 1px solid rgba(228, 64, 64, 0.25);
      border-radius: var(--radius-sm);
      color: var(--danger);
      font-size: 0.85rem;
      margin-bottom: 16px;
    }
    .btn-full { width: 100%; padding: 14px; font-size: 0.95rem; }
    .auth-footer {
      text-align: center;
      margin-top: 24px;
      font-size: 0.88rem;
      color: var(--text-muted);
    }
    .auth-footer a { color: var(--accent); margin-left: 6px; font-weight: 500; }
    @media (max-width: 480px) {
      .auth-card { padding: 32px 24px; margin: 0 16px; }
    }
  `]
})
export class RegisterComponent {
  username = '';
  email = '';
  password = '';
  error = '';
  loading = false;

  constructor(private auth: AuthService, private router: Router) {}

  register() {
    if (!this.username || !this.email || !this.password) {
      this.error = 'Completează toate câmpurile';
      return;
    }
    if (this.password.length < 4) {
      this.error = 'Parola trebuie să aibă minim 4 caractere';
      return;
    }
    this.error = '';
    this.loading = true;

    this.auth.register({
      username: this.username,
      email: this.email,
      password: this.password
    }).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/movies']);
      },
      error: () => {
        this.loading = false;
        this.error = 'Eroare la înregistrare. Încearcă alt email.';
      }
    });
  }
}
