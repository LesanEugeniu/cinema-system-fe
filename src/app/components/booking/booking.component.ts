import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { ScreeningDto, HallDto, SeatDto, MovieDto, BookingDto, GenreLabels } from '../../models/models';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-booking',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="page">
      <div class="container">
        <a routerLink="/schedule" class="back-link animate-in">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m15 18-6-6 6-6"/></svg>
          Înapoi la program
        </a>

        @if (loading) {
          <div class="loading-container"><div class="spinner"></div></div>
        } @else if (movie && hall && screening) {
          <div class="booking-layout animate-in" style="animation-delay: 0.1s">
            <!-- Seat Map -->
            <div class="seat-section">
              <h2 class="section-title">ALEGE LOCURILE</h2>

              <!-- Screen -->
              <div class="screen-wrapper">
                <div class="screen">ECRAN</div>
                <div class="screen-glow"></div>
              </div>

              <!-- Seats -->
              <div class="seat-map">
                @for (row of seatRows; track row.rowNumber) {
                  <div class="seat-row">
                    <span class="row-label">{{ row.rowNumber }}</span>
                    @for (seat of row.seats; track seat.id) {
                      <button
                        class="seat"
                        [class.selected]="isSelected(seat)"
                        [class.booked]="isBooked(seat)"
                        [disabled]="isBooked(seat)"
                        (click)="toggleSeat(seat)"
                        [title]="'Rând ' + seat.rowNumber + ', Loc ' + seat.seatNumber"
                      >
                        {{ seat.seatNumber }}
                      </button>
                    }
                    <span class="row-label">{{ row.rowNumber }}</span>
                  </div>
                }
              </div>

              <!-- Legend -->
              <div class="legend">
                <div class="legend-item">
                  <span class="legend-dot available"></span> Disponibil
                </div>
                <div class="legend-item">
                  <span class="legend-dot selected"></span> Selectat
                </div>
                <div class="legend-item">
                  <span class="legend-dot booked"></span> Ocupat
                </div>
              </div>
            </div>

            <!-- Booking Summary -->
            <div class="booking-summary">
              <div class="summary-card">
                <div class="summary-movie">
                  @if (movie.imagePath) {
                    <img [src]="api.getMovieImageUrl(movie.imagePath)" [alt]="movie.title" class="summary-poster">
                  }
                  <div>
                    <h3 class="summary-title">{{ movie.title }}</h3>
                    <p class="summary-meta">{{ genreLabels[movie.genre] || movie.genre }} · {{ movie.durationMinutes }} min</p>
                  </div>
                </div>

                <div class="summary-details">
                  <div class="summary-row">
                    <span class="summary-label">Sala</span>
                    <span class="summary-value">{{ hall.name }}</span>
                  </div>
                  <div class="summary-row">
                    <span class="summary-label">Data</span>
                    <span class="summary-value">{{ formatDate(screening.startTime) }}</span>
                  </div>
                  <div class="summary-row">
                    <span class="summary-label">Ora</span>
                    <span class="summary-value">{{ formatTime(screening.startTime) }}</span>
                  </div>
                  <div class="summary-row">
                    <span class="summary-label">Locuri</span>
                    <span class="summary-value">
                      @if (selectedSeats.length === 0) {
                        <span class="text-muted">Niciun loc selectat</span>
                      } @else {
                        {{ formatSelectedSeats() }}
                      }
                    </span>
                  </div>
                </div>

                <div class="summary-total">
                  <span>Total</span>
                  <span class="total-price">{{ (selectedSeats.length * 150).toFixed(2) }} MDL</span>
                </div>

                <button
                  class="btn btn-primary btn-book"
                  [disabled]="selectedSeats.length === 0 || booking"
                  (click)="confirmBooking()"
                >
                  @if (booking) {
                    <div class="spinner" style="width:20px;height:20px;border-width:2px"></div>
                    Se procesează...
                  } @else {
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg>
                    Confirmă Rezervarea
                  }
                </button>
              </div>
            </div>
          </div>
        }

        <!-- Success Modal -->
        @if (bookingSuccess) {
          <div class="modal-overlay" (click)="goBack()">
            <div class="modal-content success-modal" (click)="$event.stopPropagation()">
              <div class="success-icon">✓</div>
              <h2>Rezervare Confirmată!</h2>
              <p>Biletele tale au fost rezervate cu succes.</p>
              <div class="success-details">
                <p><strong>{{ movie?.title }}</strong></p>
                <p>{{ formatDate(screening?.startTime || '') }} la {{ formatTime(screening?.startTime || '') }}</p>
                <p>Locuri: {{ formatSelectedSeats() }}</p>
              </div>
              <button class="btn btn-primary" (click)="goBack()">Înapoi la Program</button>
            </div>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .back-link {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      color: var(--text-secondary);
      font-size: 0.88rem;
      margin-bottom: 28px;
      text-decoration: none;
    }
    .back-link:hover { color: var(--accent); }

    .booking-layout {
      display: grid;
      grid-template-columns: 1fr 360px;
      gap: 40px;
      align-items: start;
    }

    .section-title {
      font-family: var(--font-display);
      font-size: 1.6rem;
      letter-spacing: 3px;
      margin-bottom: 32px;
      text-align: center;
    }

    .screen-wrapper {
      text-align: center;
      margin-bottom: 40px;
      position: relative;
    }
    .screen {
      width: 70%;
      margin: 0 auto;
      padding: 8px 0;
      background: linear-gradient(180deg, var(--accent) 0%, rgba(228,169,10,0.3) 100%);
      border-radius: 4px 4px 50% 50%;
      font-size: 0.7rem;
      font-weight: 600;
      letter-spacing: 3px;
      color: var(--bg-primary);
      text-align: center;
    }
    .screen-glow {
      width: 80%;
      height: 40px;
      margin: 0 auto;
      background: radial-gradient(ellipse, var(--accent-glow) 0%, transparent 70%);
      margin-top: -5px;
    }

    .seat-map {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      margin-bottom: 28px;
    }
    .seat-row {
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .row-label {
      width: 24px;
      text-align: center;
      font-size: 0.72rem;
      color: var(--text-muted);
      font-weight: 600;
    }
    .seat {
      width: 38px;
      height: 34px;
      border-radius: 6px 6px 3px 3px;
      border: 1.5px solid var(--border-light);
      background: var(--bg-card);
      color: var(--text-muted);
      font-size: 0.7rem;
      font-weight: 600;
      cursor: pointer;
      transition: all var(--transition);
      font-family: var(--font-body);
    }
    .seat:hover:not(.booked) {
      border-color: var(--accent);
      background: var(--accent-dim);
      color: var(--accent);
      transform: scale(1.1);
    }
    .seat.selected {
      background: var(--accent);
      border-color: var(--accent);
      color: var(--bg-primary);
      box-shadow: 0 2px 10px rgba(228, 169, 10, 0.3);
      transform: scale(1.05);
    }
    .seat.booked {
      background: var(--bg-secondary);
      border-color: var(--border);
      color: var(--border);
      cursor: not-allowed;
      opacity: 0.4;
    }

    .legend {
      display: flex;
      justify-content: center;
      gap: 28px;
    }
    .legend-item {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 0.8rem;
      color: var(--text-secondary);
    }
    .legend-dot {
      width: 16px;
      height: 14px;
      border-radius: 4px 4px 2px 2px;
    }
    .legend-dot.available {
      border: 1.5px solid var(--border-light);
      background: var(--bg-card);
    }
    .legend-dot.selected {
      background: var(--accent);
    }
    .legend-dot.booked {
      background: var(--bg-secondary);
      border: 1.5px solid var(--border);
      opacity: 0.4;
    }

    .summary-card {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: var(--radius-xl);
      padding: 28px;
      position: sticky;
      top: calc(var(--navbar-height) + 24px);
    }

    .summary-movie {
      display: flex;
      gap: 16px;
      align-items: center;
      padding-bottom: 20px;
      border-bottom: 1px solid var(--border);
      margin-bottom: 20px;
    }
    .summary-poster {
      width: 60px;
      height: 85px;
      object-fit: cover;
      border-radius: var(--radius-sm);
    }
    .summary-title {
      font-family: var(--font-display);
      font-size: 1.3rem;
      letter-spacing: 1px;
    }
    .summary-meta {
      font-size: 0.82rem;
      color: var(--text-muted);
      margin-top: 4px;
    }

    .summary-details { margin-bottom: 20px; }
    .summary-row {
      display: flex;
      justify-content: space-between;
      padding: 10px 0;
      border-bottom: 1px solid var(--border);
    }
    .summary-label {
      font-size: 0.82rem;
      color: var(--text-muted);
    }
    .summary-value {
      font-size: 0.88rem;
      font-weight: 500;
      color: var(--text-primary);
    }
    .text-muted { color: var(--text-muted); font-weight: 400; }

    .summary-total {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 18px 0;
      font-size: 1rem;
      color: var(--text-secondary);
    }
    .total-price {
      font-family: var(--font-display);
      font-size: 1.8rem;
      letter-spacing: 1px;
      color: var(--accent);
    }

    .btn-book {
      width: 100%;
      padding: 16px;
      font-size: 1rem;
    }
    .btn-book:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      transform: none;
    }

    .success-modal {
      text-align: center;
    }
    .success-icon {
      width: 70px;
      height: 70px;
      margin: 0 auto 20px;
      background: var(--success);
      color: #fff;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 2rem;
      font-weight: 700;
    }
    .success-modal h2 {
      font-family: var(--font-display);
      font-size: 2rem;
      letter-spacing: 2px;
      margin-bottom: 8px;
    }
    .success-modal > p {
      color: var(--text-secondary);
      margin-bottom: 20px;
    }
    .success-details {
      background: var(--bg-card);
      border-radius: var(--radius-md);
      padding: 18px;
      margin-bottom: 24px;
    }
    .success-details p {
      font-size: 0.9rem;
      color: var(--text-secondary);
      margin-bottom: 4px;
    }

    @media (max-width: 768px) {
      .booking-layout {
        grid-template-columns: 1fr;
      }
      .seat { width: 32px; height: 28px; font-size: 0.6rem; }
      .summary-card { position: static; }
    }
  `]
})
export class BookingComponent implements OnInit {
  screeningId!: number;
  screening: ScreeningDto | null = null;
  movie: MovieDto | null = null;
  hall: HallDto | null = null;
  seats: SeatDto[] = [];
  bookedSeatIds: Set<number> = new Set();
  selectedSeats: SeatDto[] = [];
  seatRows: { rowNumber: number; seats: SeatDto[] }[] = [];
  loading = true;
  booking = false;
  bookingSuccess = false;

  genreLabels = GenreLabels;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    public api: ApiService,
    private auth: AuthService
  ) {}

  ngOnInit() {
    this.screeningId = Number(this.route.snapshot.paramMap.get('screeningId'));
    this.loadData();
  }

  private loadData() {
    this.api.getScreening(this.screeningId).subscribe(screening => {
      this.screening = screening;

      forkJoin([
        this.api.getMovie(screening.movieId),
        this.api.getHall(screening.hallId),
        this.api.getSeatsByHallId(screening.hallId)
      ]).subscribe(([movie, hall, allSeats]) => {
        this.movie = movie;
        this.hall = hall;
        this.seats = allSeats;

        // Load booked seats for this screening
        this.api.getBookingsByScreeningId(screening.id!).subscribe(bookings => {
          bookings.forEach(b => b.seatIds?.forEach(id => this.bookedSeatIds.add(id)));
          this.buildSeatMap();
          this.loading = false;
        });
      });
    });
  }

  private buildSeatMap() {
    const rowMap = new Map<number, SeatDto[]>();
    for (const seat of this.seats) {
      if (!rowMap.has(seat.rowNumber)) rowMap.set(seat.rowNumber, []);
      rowMap.get(seat.rowNumber)!.push(seat);
    }
    this.seatRows = Array.from(rowMap.entries())
      .sort(([a], [b]) => a - b)
      .map(([rowNumber, seats]) => ({
        rowNumber,
        seats: seats.sort((a, b) => a.seatNumber - b.seatNumber)
      }));
  }

  isSelected(seat: SeatDto): boolean {
    return this.selectedSeats.some(s => s.id === seat.id);
  }

  isBooked(seat: SeatDto): boolean {
    return this.bookedSeatIds.has(seat.id!);
  }

  toggleSeat(seat: SeatDto) {
    if (this.isSelected(seat)) {
      this.selectedSeats = this.selectedSeats.filter(s => s.id !== seat.id);
    } else {
      this.selectedSeats = [...this.selectedSeats, seat];
    }
  }

  formatSelectedSeats(): string {
    return this.selectedSeats
      .sort((a, b) => a.rowNumber - b.rowNumber || a.seatNumber - b.seatNumber)
      .map(s => `R${s.rowNumber}L${s.seatNumber}`)
      .join(', ');
  }

  confirmBooking() {
    const userId = this.auth.getUserId();
    if (!userId) {
      // Try to get from token
      const user = this.auth.currentUser();
      if (!user) return;
    }

    this.booking = true;
    const bookingDto: BookingDto = {
      bookingDate: new Date().toISOString(),
      totalPrice: this.selectedSeats.length * 150,
      userId: this.auth.getUserId() || 1,
      screeningId: this.screeningId,
      seatIds: this.selectedSeats.map(s => s.id!)
    };

    this.api.createBooking(bookingDto).subscribe({
      next: () => {
        this.booking = false;
        this.bookingSuccess = true;
      },
      error: () => {
        this.booking = false;
        alert('Eroare la rezervare. Încearcă din nou.');
      }
    });
  }

  formatTime(dateStr: string): string {
    const d = new Date(dateStr);
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  }

  formatDate(dateStr: string): string {
    const d = new Date(dateStr);
    const months = ['Ian', 'Feb', 'Mar', 'Apr', 'Mai', 'Iun', 'Iul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
  }

  goBack() {
    this.router.navigate(['/schedule']);
  }
}
