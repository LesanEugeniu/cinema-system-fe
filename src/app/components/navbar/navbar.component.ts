import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent {
  mobileOpen = false;

  constructor(public auth: AuthService) { }

  getUserInitial(): string {
    const user = this.auth.currentUser();
    return user?.sub?.charAt(0).toUpperCase() ?? '?';
  }
}
