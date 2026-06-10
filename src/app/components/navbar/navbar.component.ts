import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <nav class="navbar">
      <div class="navbar-inner container">
        <a routerLink="/movies" class="logo">
          <span class="logo-icon">▶</span>
          <span class="logo-text">CINE<span class="logo-accent">TICKET</span></span>
        </a>

        <div class="nav-links">
          <a routerLink="/movies" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" class="nav-link">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="2.18"/><line x1="7" y1="2" x2="7" y2="22"/><line x1="17" y1="2" x2="17" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/><line x1="2" y1="7" x2="7" y2="7"/><line x1="2" y1="17" x2="7" y2="17"/><line x1="17" y1="7" x2="22" y2="7"/><line x1="17" y1="17" x2="22" y2="17"/></svg>
            Filme
          </a>
          <a routerLink="/schedule" routerLinkActive="active" class="nav-link">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            Program
          </a>
          @if (auth.isLoggedIn()) {
            <a routerLink="/my-bookings" routerLinkActive="active" class="nav-link">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 5v2M9 5v2M4 11h16M4 7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7z"/><path d="M9 16h6"/></svg>
              Rezervările mele
            </a>
          }
          @if (auth.isAdmin()) {
            <a routerLink="/admin" routerLinkActive="active" class="nav-link nav-admin">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
              Admin
            </a>
          }
        </div>

        <div class="nav-actions">
          @if (auth.isLoggedIn()) {
            <div class="user-pill">
              <span class="user-avatar">{{ getUserInitial() }}</span>
              <span class="user-name">{{ auth.currentUser()?.sub }}</span>
            </div>
            <button class="btn btn-secondary btn-sm" (click)="auth.logout()">Ieșire</button>
          } @else {
            <a routerLink="/login" class="btn btn-primary btn-sm">Autentificare</a>
          }
        </div>

        <button class="mobile-toggle" (click)="mobileOpen = !mobileOpen">
          <span></span><span></span><span></span>
        </button>
      </div>

      @if (mobileOpen) {
        <div class="mobile-menu">
          <a routerLink="/movies" routerLinkActive="active" (click)="mobileOpen=false">Filme</a>
          <a routerLink="/schedule" routerLinkActive="active" (click)="mobileOpen=false">Program</a>
          @if (auth.isLoggedIn()) {
            <a routerLink="/my-bookings" routerLinkActive="active" (click)="mobileOpen=false">Rezervările mele</a>
          }
          @if (auth.isAdmin()) {
            <a routerLink="/admin" routerLinkActive="active" (click)="mobileOpen=false">Admin</a>
          }
          @if (auth.isLoggedIn()) {
            <button (click)="auth.logout(); mobileOpen=false">Ieșire</button>
          } @else {
            <a routerLink="/login" (click)="mobileOpen=false">Autentificare</a>
          }
        </div>
      }
    </nav>
  `,
  styles: [`
    .navbar {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      height: var(--navbar-height);
      background: rgba(10, 10, 15, 0.85);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border-bottom: 1px solid var(--border);
      z-index: 1000;
    }
    .navbar-inner {
      display: flex;
      align-items: center;
      height: 100%;
      gap: 40px;
    }
    .logo {
      display: flex;
      align-items: center;
      gap: 10px;
      text-decoration: none;
      flex-shrink: 0;
    }
    .logo-icon {
      width: 36px;
      height: 36px;
      background: var(--accent);
      color: var(--bg-primary);
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 700;
    }
    .logo-text {
      font-family: var(--font-display);
      font-size: 1.55rem;
      letter-spacing: 3px;
      color: var(--text-primary);
    }
    .logo-accent { color: var(--accent); }

    .nav-links {
      display: flex;
      align-items: center;
      gap: 6px;
      flex: 1;
    }
    .nav-link {
      display: flex;
      align-items: center;
      gap: 7px;
      padding: 8px 16px;
      border-radius: var(--radius-sm);
      color: var(--text-secondary);
      font-size: 0.88rem;
      font-weight: 500;
      text-decoration: none;
      transition: all var(--transition);
    }
    .nav-link:hover {
      color: var(--text-primary);
      background: rgba(255,255,255,0.04);
    }
    .nav-link.active {
      color: var(--accent);
      background: var(--accent-dim);
    }
    .nav-admin { margin-left: auto; }

    .nav-actions {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .user-pill {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 5px 14px 5px 5px;
      background: var(--bg-card);
      border-radius: 30px;
      border: 1px solid var(--border);
    }
    .user-avatar {
      width: 28px;
      height: 28px;
      background: var(--accent);
      color: var(--bg-primary);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.75rem;
      font-weight: 700;
    }
    .user-name {
      font-size: 0.82rem;
      color: var(--text-secondary);
      max-width: 120px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .mobile-toggle {
      display: none;
      flex-direction: column;
      gap: 4px;
      background: none;
      border: none;
      cursor: pointer;
      padding: 8px;
    }
    .mobile-toggle span {
      width: 22px;
      height: 2px;
      background: var(--text-primary);
      border-radius: 2px;
    }

    .mobile-menu {
      display: none;
      flex-direction: column;
      background: var(--bg-secondary);
      border-top: 1px solid var(--border);
      padding: 16px 24px;
    }
    .mobile-menu a, .mobile-menu button {
      padding: 14px 0;
      color: var(--text-secondary);
      font-size: 0.95rem;
      text-decoration: none;
      border: none;
      background: none;
      text-align: left;
      cursor: pointer;
      font-family: var(--font-body);
      border-bottom: 1px solid var(--border);
    }
    .mobile-menu a.active { color: var(--accent); }

    @media (max-width: 768px) {
      .nav-links, .nav-actions { display: none; }
      .mobile-toggle { display: flex; }
      .mobile-menu { display: flex; }
    }
  `]
})
export class NavbarComponent {
  mobileOpen = false;

  constructor(public auth: AuthService) {}

  getUserInitial(): string {
    const user = this.auth.currentUser();
    return user?.sub?.charAt(0).toUpperCase() ?? '?';
  }
}
