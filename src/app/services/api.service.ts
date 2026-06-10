import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import {
  MovieDto, MovieSearchDto, MovieByScreeningDto,
  ActorDto, DirectorDto, HallDto, SeatDto,
  ScreeningDto, BookingDto
} from '../models/models';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly api = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // ===== MOVIES =====
  getMovies(page = 0, size = 50): Observable<MovieDto[]> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<MovieDto[]>(`${this.api}/movies`, { params });
  }

  getMovie(id: number): Observable<MovieDto> {
    return this.http.get<MovieDto>(`${this.api}/movies/${id}`);
  }

  searchMovies(search: MovieSearchDto, page = 0, size = 50): Observable<any> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.post<any>(`${this.api}/movies/search`, search, { params });
  }

  getMoviesByScreening(dto: MovieByScreeningDto): Observable<MovieDto[]> {
    return this.http.post<MovieDto[]>(`${this.api}/movies/by-screening`, dto);
  }

  createMovie(movie: MovieDto, image?: File): Observable<MovieDto> {
    const formData = new FormData();
    formData.append('movie', new Blob([JSON.stringify(movie)], { type: 'application/json' }));
    if (image) formData.append('image', image);
    return this.http.post<MovieDto>(`${this.api}/movies`, formData);
  }

  updateMovie(id: number, movie: MovieDto, image?: File): Observable<MovieDto> {
    const formData = new FormData();
    formData.append('movie', new Blob([JSON.stringify(movie)], { type: 'application/json' }));
    if (image) formData.append('image', image);
    return this.http.put<MovieDto>(`${this.api}/movies/${id}`, formData);
  }

  deleteMovie(id: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/movies/${id}`);
  }

  getMovieImageUrl(imagePath: string): string {
    if (!imagePath) return '';
    const filename = imagePath.split('/').pop();
    return `${this.api}/movies/image/${filename}`;
  }

  // ===== ACTORS =====
  getActors(page = 0, size = 100): Observable<ActorDto[]> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<ActorDto[]>(`${this.api}/actors`, { params });
  }

  getActor(id: number): Observable<ActorDto> {
    return this.http.get<ActorDto>(`${this.api}/actors/${id}`);
  }

  createActor(actor: ActorDto): Observable<ActorDto> {
    return this.http.post<ActorDto>(`${this.api}/actors`, actor);
  }

  updateActor(id: number, actor: ActorDto): Observable<ActorDto> {
    return this.http.put<ActorDto>(`${this.api}/actors/${id}`, actor);
  }

  deleteActor(id: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/actors/${id}`);
  }

  // ===== DIRECTORS =====
  getDirectors(page = 0, size = 100): Observable<DirectorDto[]> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<DirectorDto[]>(`${this.api}/directors`, { params });
  }

  getDirector(id: number): Observable<DirectorDto> {
    return this.http.get<DirectorDto>(`${this.api}/directors/${id}`);
  }

  createDirector(director: DirectorDto): Observable<DirectorDto> {
    return this.http.post<DirectorDto>(`${this.api}/directors`, director);
  }

  updateDirector(id: number, director: DirectorDto): Observable<DirectorDto> {
    return this.http.put<DirectorDto>(`${this.api}/directors/${id}`, director);
  }

  deleteDirector(id: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/directors/${id}`);
  }

  // ===== HALLS =====
  getHalls(page = 0, size = 50): Observable<HallDto[]> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<HallDto[]>(`${this.api}/halls`, { params });
  }

  getHall(id: number): Observable<HallDto> {
    return this.http.get<HallDto>(`${this.api}/halls/${id}`);
  }

  createHall(hall: HallDto): Observable<HallDto> {
    return this.http.post<HallDto>(`${this.api}/halls`, hall);
  }

  updateHall(id: number, hall: HallDto): Observable<HallDto> {
    return this.http.put<HallDto>(`${this.api}/halls/${id}`, hall);
  }

  deleteHall(id: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/halls/${id}`);
  }

  // ===== SEATS =====
  getSeats(page = 0, size = 200): Observable<SeatDto[]> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<SeatDto[]>(`${this.api}/seats`, { params });
  }

  getSeatsByHallId(id: number): Observable<SeatDto[]> {
    return this.http.get<SeatDto[]>(`${this.api}/seats/by-hall/${id}`);
  }

  getSeat(id: number): Observable<SeatDto> {
    return this.http.get<SeatDto>(`${this.api}/seats/${id}`);
  }

  createSeat(seat: SeatDto): Observable<SeatDto> {
    return this.http.post<SeatDto>(`${this.api}/seats`, seat);
  }

  updateSeat(id: number, seat: SeatDto): Observable<SeatDto> {
    return this.http.put<SeatDto>(`${this.api}/seats/${id}`, seat);
  }

  deleteSeat(id: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/seats/${id}`);
  }

  // ===== SCREENINGS =====
  getScreenings(page = 0, size = 100): Observable<ScreeningDto[]> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<ScreeningDto[]>(`${this.api}/screenings`, { params });
  }

  getScreening(id: number): Observable<ScreeningDto> {
    return this.http.get<ScreeningDto>(`${this.api}/screenings/${id}`);
  }

  createScreening(screening: ScreeningDto): Observable<ScreeningDto> {
    return this.http.post<ScreeningDto>(`${this.api}/screenings`, screening);
  }

  updateScreening(id: number, screening: ScreeningDto): Observable<ScreeningDto> {
    return this.http.put<ScreeningDto>(`${this.api}/screenings/${id}`, screening);
  }

  deleteScreening(id: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/screenings/${id}`);
  }

  // ===== BOOKINGS =====
  getBookings(page = 0, size = 100): Observable<BookingDto[]> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<BookingDto[]>(`${this.api}/bookings`, { params });
  }

  getMyBookings(page = 0, size = 100): Observable<BookingDto[]> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<BookingDto[]>(`${this.api}/bookings/my`, { params });
  }

  downloadTicketsPdf(bookingId: number): Observable<Blob> {
    return this.http.get(`${this.api}/bookings/${bookingId}/tickets/pdf`, {
      responseType: 'blob'
    });
  }

  getBookingsByScreeningId(id: number): Observable<BookingDto[]> {
    return this.http.get<BookingDto[]>(`${this.api}/bookings/by-screening/${id}`);
  }

  getBooking(id: number): Observable<BookingDto> {
    return this.http.get<BookingDto>(`${this.api}/bookings/${id}`);
  }

  createBooking(booking: BookingDto): Observable<BookingDto> {
    return this.http.post<BookingDto>(`${this.api}/bookings`, booking);
  }

  updateBooking(id: number, booking: BookingDto): Observable<BookingDto> {
    return this.http.put<BookingDto>(`${this.api}/bookings/${id}`, booking);
  }

  deleteBooking(id: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/bookings/${id}`);
  }

  getUserEmailById(id: number): Observable<string> {
    return this.http.get(`${this.api}/users/${id}`, { responseType: 'text' });
  }

}
