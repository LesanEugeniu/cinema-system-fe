import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {
  username = '';
  email = '';
  password = '';
  error = '';
  loading = false;

  constructor(private auth: AuthService, private router: Router) { }

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
