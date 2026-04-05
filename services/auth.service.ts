import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '@env/environment';
import { AuthenticationRequest, AuthenticationResponse, RegisterRequest, Role } from '../models/models';

interface JwtPayload {
  sub: string;
  role: string;
  exp: number;
  userId?: number;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly apiUrl = `${environment.apiUrl}/auth`;
  private tokenSignal = signal<string | null>(this.getStoredToken());

  isLoggedIn = computed(() => !!this.tokenSignal() && !this.isTokenExpired());
  currentUser = computed(() => {
    const token = this.tokenSignal();
    if (!token) return null;
    return this.decodeToken(token);
  });
  isAdmin = computed(() => this.currentUser()?.role === 'ROLE_ADMIN');

  constructor(private http: HttpClient, private router: Router) {}

  login(request: AuthenticationRequest): Observable<AuthenticationResponse> {
    return this.http.post<AuthenticationResponse>(`${this.apiUrl}/authenticate`, request).pipe(
      tap(response => {
        localStorage.setItem('access_token', response.access_token);
        localStorage.setItem('refresh_token', response.refresh_token);
        this.tokenSignal.set(response.access_token);
      })
    );
  }

  register(request: RegisterRequest): Observable<AuthenticationResponse> {
    return this.http.post<AuthenticationResponse>(`${this.apiUrl}/register`, request).pipe(
      tap(response => {
        localStorage.setItem('access_token', response.access_token);
        localStorage.setItem('refresh_token', response.refresh_token);
        this.tokenSignal.set(response.access_token);
      })
    );
  }

  logout(): void {
    const token = this.getStoredToken();
    if (token) {
      this.http.post(`${this.apiUrl}/logout`, {}).subscribe({ error: () => {} });
    }
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    this.tokenSignal.set(null);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return this.tokenSignal();
  }

  getUserId(): number | null {
    const payload = this.currentUser();
    return payload?.userId ?? null;
  }

  private getStoredToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('access_token');
    }
    return null;
  }

  private decodeToken(token: string): JwtPayload | null {
    try {
      const payload = token.split('.')[1];
      const decoded = JSON.parse(atob(payload));

      console.log("decoded: ", decoded);
      console.log("payload: ", payload);
      return decoded;
    } catch {
      return null;
    }
  }

  private isTokenExpired(): boolean {
    const payload = this.currentUser();
    if (!payload) return true;
    return Date.now() >= payload.exp * 1000;
  }
}
