import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { adminGuard } from './guards/admin.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'movies',
    pathMatch: 'full'
  },
  {
    path: 'movies',
    loadComponent: () => import('./components/movies/movies.component').then(m => m.MoviesComponent)
  },
  {
    path: 'movies/:id',
    loadComponent: () => import('./components/movie-detail/movie-detail.component').then(m => m.MovieDetailComponent)
  },
  {
    path: 'schedule',
    loadComponent: () => import('./components/schedule/schedule.component').then(m => m.ScheduleComponent)
  },
  {
    path: 'booking/:screeningId',
    loadComponent: () => import('./components/booking/booking.component').then(m => m.BookingComponent),
    canActivate: [authGuard]
  },
  {
    path: 'my-bookings',
    loadComponent: () => import('./components/my-bookings/my-bookings.component').then(m => m.MyBookingsComponent),
    canActivate: [authGuard]
  },
  {
    path: 'login',
    loadComponent: () => import('./components/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./components/register/register.component').then(m => m.RegisterComponent)
  },
  {
    path: 'admin',
    loadComponent: () => import('./components/admin/admin.component').then(m => m.AdminComponent),
    canActivate: [authGuard, adminGuard]
  },
  {
    path: '**',
    redirectTo: 'movies'
  }
];
