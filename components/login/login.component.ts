import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="page">
      <div class="auth-container animate-in">
        <div class="auth-card">
          <div class="auth-header">
            <div class="auth-logo">▶</div>
            <h1>AUTENTIFICARE</h1>
            <p>Intră în cont pentru a rezerva bilete</p>
          </div>

          <div class="auth-form">
            <div class="form-group">
              <label for="email">Email</label>
              <input id="email" type="email" class="form-control" [(ngModel)]="email"
                     placeholder="exemplu@mail.com" (keyup.enter)="login()">
            </div>
            <div class="form-group">
              <label for="password">Parolă</label>
              <input id="password" type="password" class="form-control" [(ngModel)]="password"
                     placeholder="••••••••" (keyup.enter)="login()">
            </div>

            @if (error) {
              <div class="error-msg">{{ error }}</div>
            }

            <button class="btn btn-primary btn-full" (click)="login()" [disabled]="loading">
              @if (loading) {
                <div class="spinner" style="width:18px;height:18px;border-width:2px"></div>
              } @else {
                Intră în cont
              }
            </button>
          </div>

          <div class="auth-footer">
            <span>Nu ai cont?</span>
            <a routerLink="/register">Creează cont</a>
          </div>
        </div>

        <div class="auth-decoration">
          <div class="deco-circle c1"></div>
          <div class="deco-circle c2"></div>
          <div class="deco-circle c3"></div>
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
      position: relative;
    }

    .auth-card {
      width: 100%;
      max-width: 420px;
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: var(--radius-xl);
      padding: 48px 40px;
      position: relative;
      z-index: 2;
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

    .btn-full {
      width: 100%;
      padding: 14px;
      font-size: 0.95rem;
    }

    .auth-footer {
      text-align: center;
      margin-top: 24px;
      font-size: 0.88rem;
      color: var(--text-muted);
    }
    .auth-footer a {
      color: var(--accent);
      margin-left: 6px;
      font-weight: 500;
    }

    .auth-decoration {
      position: absolute;
      inset: 0;
      pointer-events: none;
      overflow: hidden;
    }
    .deco-circle {
      position: absolute;
      border-radius: 50%;
      opacity: 0.06;
    }
    .c1 {
      width: 400px;
      height: 400px;
      background: var(--accent);
      top: -100px;
      right: -100px;
    }
    .c2 {
      width: 300px;
      height: 300px;
      background: var(--accent);
      bottom: -80px;
      left: -80px;
    }
    .c3 {
      width: 180px;
      height: 180px;
      border: 2px solid var(--accent);
      top: 40%;
      right: 10%;
    }

    @media (max-width: 480px) {
      .auth-card { padding: 32px 24px; margin: 0 16px; }
    }
  `]
})
export class LoginComponent {
  email = '';
  password = '';
  error = '';
  loading = false;

  constructor(private auth: AuthService, private router: Router) {}

  login() {
    if (!this.email || !this.password) {
      this.error = 'Completează toate câmpurile';
      return;
    }
    this.error = '';
    this.loading = true;

    this.auth.login({ email: this.email, password: this.password }).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/movies']);
      },
      error: (err) => {
        this.loading = false;
        this.error = 'Email sau parolă incorectă';
      }
    });
  }
}
