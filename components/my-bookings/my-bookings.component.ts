import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { BookingDto, MovieDto, ScreeningDto, HallDto, GenreLabels, FormatTypeLabels } from '../../models/models';
import { forkJoin } from 'rxjs';
import {DomSanitizer, SafeResourceUrl} from "@angular/platform-browser";

interface BookingView {
  booking: BookingDto;
  movie?: MovieDto;
  screening?: ScreeningDto;
  hall?: HallDto;
  downloading?: boolean;
  viewing?: boolean;
}

@Component({
  selector: 'app-my-bookings',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="page">
      <div class="container">
        <div class="hero-banner animate-in">
          <h1 class="page-title">REZERVĂRILE MELE</h1>
          <p class="page-subtitle">Istoric bilete și descărcare PDF</p>
        </div>

        @if (loading) {
          <div class="loading-container"><div class="spinner"></div></div>
        } @else if (bookingViews.length === 0) {
          <div class="empty-state animate-in">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" stroke-width="1.5">
              <path d="M15 5v2M9 5v2M4 11h16M4 7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7z"/>
              <path d="M9 16h6"/>
            </svg>
            <h3>Nicio rezervare</h3>
            <p>Nu ai nicio rezervare încă. Mergi la <a routerLink="/schedule">Program</a> pentru a rezerva bilete.</p>
          </div>
        } @else {
          <div class="bookings-list">
            @for (bv of bookingViews; track bv.booking.id; let i = $index) {
              <div class="booking-card animate-in" [style.animation-delay]="(i * 0.06) + 's'">
                <!-- Poster -->
                <div class="booking-poster">
                  @if (bv.movie?.imagePath) {
                    <img [src]="api.getMovieImageUrl(bv.movie!.imagePath!)" [alt]="bv.movie!.title">
                  } @else {
                    <div class="poster-placeholder">
                      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="2" width="20" height="20" rx="2"/></svg>
                    </div>
                  }
                </div>

                <!-- Info -->
                <div class="booking-info">
                  <div class="booking-top">
                    <h3 class="booking-movie-title">{{ bv.movie?.title || 'Film #' + bv.booking.screeningId }}</h3>
                    <div class="booking-meta">
                      @if (bv.movie) {
                        <span class="badge badge-accent">{{ formatLabels[bv.movie.formatType] || bv.movie.formatType }}</span>
                        <span>{{ genreLabels[bv.movie.genre] || bv.movie.genre }}</span>
                        <span class="dot">·</span>
                        <span>{{ bv.movie.durationMinutes }} min</span>
                      }
                    </div>
                  </div>

                  <div class="booking-details">
                    <div class="detail-item">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                      <span>{{ formatDate(bv.screening?.startTime || bv.booking.bookingDate) }}</span>
                    </div>
                    <div class="detail-item">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                      <span>{{ formatTime(bv.screening?.startTime || bv.booking.bookingDate) }}</span>
                    </div>
                    @if (bv.hall) {
                      <div class="detail-item">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="2"><path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V7"/><path d="M1 4h22v3H1z"/></svg>
                        <span>{{ bv.hall.name }}</span>
                      </div>
                    }
                    <div class="detail-item">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="2"><rect x="4" y="5" width="16" height="16" rx="1"/><path d="M4 9h16"/></svg>
                      <span>{{ bv.booking.seatIds?.length || 0 }} locuri</span>
                    </div>
                  </div>

                  <div class="booking-price">
                    <span class="price-value">{{ bv.booking.totalPrice?.toFixed(2) }} MDL</span>
                  </div>
                </div>

                <!-- Actions -->
                <div class="booking-actions">
                  <button class="btn btn-primary btn-sm" (click)="downloadPdf(bv)" [disabled]="bv.downloading">
                    @if (bv.downloading) {
                      <div class="spinner" style="width:14px;height:14px;border-width:2px"></div>
                    } @else {
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                    }
                    Print
                  </button>
                  <button class="btn btn-secondary btn-sm" (click)="viewPdf(bv)" [disabled]="bv.viewing">
                    @if (bv.viewing) {
                      <div class="spinner" style="width:14px;height:14px;border-width:2px"></div>
                    } @else {
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    }
                    Vizualizează
                  </button>
                </div>
              </div>
            }
          </div>
        }
      </div>
    </div>

    <div class="pdf-modal" *ngIf="showPdfModal">
      <div class="pdf-modal" (click)="closePdf()">
        <div class="pdf-container" (click)="$event.stopPropagation()">
          <button class="close-btn" (click)="closePdf()">×</button>
          <iframe [src]="pdfUrl"></iframe>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .hero-banner {
      padding: 50px 40px;
      border-radius: var(--radius-xl);
      background: linear-gradient(135deg, var(--bg-secondary), var(--bg-card));
      border: 1px solid var(--border);
      margin-bottom: 28px;
    }

    .bookings-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .booking-card {
      display: flex;
      align-items: center;
      gap: 24px;
      padding: 24px;
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      transition: all var(--transition);
    }
    .booking-card:hover {
      border-color: var(--border-light);
      box-shadow: var(--shadow-md);
    }

    .booking-poster {
      width: 90px;
      height: 125px;
      border-radius: var(--radius-sm);
      overflow: hidden;
      flex-shrink: 0;
      background: var(--bg-secondary);
    }
    .booking-poster img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .poster-placeholder {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--text-muted);
    }

    .booking-info {
      flex: 1;
      min-width: 0;
    }
    .booking-movie-title {
      font-family: var(--font-display);
      font-size: 1.4rem;
      letter-spacing: 1px;
      margin-bottom: 6px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .booking-meta {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 0.82rem;
      color: var(--text-muted);
      margin-bottom: 14px;
    }
    .dot { opacity: 0.4; }

    .booking-details {
      display: flex;
      flex-wrap: wrap;
      gap: 18px;
      margin-bottom: 10px;
    }
    .detail-item {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 0.85rem;
      color: var(--text-secondary);
    }

    .booking-price {
      margin-top: 8px;
    }
    .price-value {
      font-family: var(--font-display);
      font-size: 1.3rem;
      letter-spacing: 1px;
      color: var(--accent);
    }

    .booking-actions {
      display: flex;
      flex-direction: column;
      gap: 8px;
      flex-shrink: 0;
    }
    .booking-actions .btn {
      min-width: 150px;
      justify-content: center;
    }

    .empty-state {
      text-align: center;
      padding: 80px 20px;
      color: var(--text-muted);
    }
    .empty-state h3 {
      margin-top: 16px;
      color: var(--text-secondary);
      font-family: var(--font-display);
      font-size: 1.5rem;
      letter-spacing: 2px;
    }
    .empty-state p {
      margin-top: 8px;
    }
    .empty-state a {
      color: var(--accent);
    }

    .pdf-modal {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;

      display: flex;
      justify-content: center;
      align-items: center;

      background: rgba(0, 0, 0, 0.6);
      backdrop-filter: blur(6px);

      z-index: 1000;

      animation: fadeIn 0.25s ease-in-out;
    }

    .pdf-container {
      width: 85%;
      height: 90%;

      background: #ffffff;
      border-radius: 12px;
      overflow: hidden;

      position: relative;

      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);

      transform: scale(0.95);
      animation: scaleIn 0.25s ease forwards;
    }

    /* iframe să ocupe tot */
    .pdf-container iframe {
      width: 100%;
      height: 100%;
      border: none;
    }

    /* Buton modern */
    .close-btn {
      position: absolute;
      top: 12px;
      right: 12px;

      width: 36px;
      height: 36px;

      border: none;
      border-radius: 50%;

      background: rgba(0, 0, 0, 0.6);
      color: white;

      font-size: 18px;
      font-weight: bold;

      cursor: pointer;

      display: flex;
      align-items: center;
      justify-content: center;

      transition: all 0.2s ease;
    }

    .close-btn:hover {
      background: #ff4d4f;
      transform: rotate(90deg) scale(1.1);
    }

    /* Animations */
    @keyframes fadeIn {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }

    @keyframes scaleIn {
      to {
        transform: scale(1);
      }
    }
    
    @media (max-width: 768px) {
      .booking-card {
        flex-direction: column;
        align-items: stretch;
        gap: 16px;
      }
      .booking-poster {
        width: 100%;
        height: 200px;
      }
      .booking-actions {
        flex-direction: row;
      }
      .booking-actions .btn {
        flex: 1;
      }
    }
  `]
})
export class MyBookingsComponent implements OnInit {
  bookingViews: BookingView[] = [];
  loading = true;

  genreLabels = GenreLabels;
  formatLabels = FormatTypeLabels;

  pdfUrl: SafeResourceUrl | null = null;
  private rawPdfUrl: string | null = null;
  showPdfModal = false;

  constructor(public api: ApiService, private sanitizer: DomSanitizer) {}

  ngOnInit() {
    this.loadMyBookings();
  }

  private loadMyBookings() {
    this.loading = true;
    this.api.getMyBookings(0, 100).subscribe({
      next: bookings => {
        console.log(bookings)
        this.bookingViews = bookings.map(b => ({ booking: b }));
        this.enrichBookings();
      },
      error: () => this.loading = false
    });
  }

  private enrichBookings() {
    if (this.bookingViews.length === 0) {
      this.loading = false;
      return;
    }

    // Collect unique screening IDs
    const screeningIds = [...new Set(this.bookingViews.map(bv => bv.booking.screeningId))];
    const screeningObs = screeningIds.map(id => this.api.getScreening(id));

    if (screeningObs.length === 0) {
      this.loading = false;
      return;
    }

    forkJoin(screeningObs).subscribe({
      next: screenings => {
        const screeningMap = new Map(screenings.map(s => [s.id!, s]));

        // Get unique movie and hall IDs
        const movieIds = [...new Set(screenings.map(s => s.movieId))];
        const hallIds = [...new Set(screenings.map(s => s.hallId))];

        const movieObs = movieIds.map(id => this.api.getMovie(id));
        const hallObs = hallIds.map(id => this.api.getHall(id));

        forkJoin([...movieObs, ...hallObs]).subscribe({
          next: results => {
            const movies = results.slice(0, movieIds.length) as MovieDto[];
            const halls = results.slice(movieIds.length) as HallDto[];

            const movieMap = new Map(movies.map(m => [m.id!, m]));
            const hallMap = new Map(halls.map(h => [h.id!, h]));

            for (const bv of this.bookingViews) {
              const screening = screeningMap.get(bv.booking.screeningId);
              bv.screening = screening;
              if (screening) {
                bv.movie = movieMap.get(screening.movieId);
                bv.hall = hallMap.get(screening.hallId);
              }
            }

            // Sort by booking date descending
            this.bookingViews.sort((a, b) =>
              new Date(b.booking.bookingDate).getTime() - new Date(a.booking.bookingDate).getTime()
            );

            this.loading = false;
          },
          error: () => this.loading = false
        });
      },
      error: () => this.loading = false
    });
  }

  downloadPdf(bv: BookingView) {
    bv.downloading = true;
    this.api.downloadTicketsPdf(bv.booking.id!).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ticket-${bv.booking.id}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        bv.downloading = false;
      },
      error: () => {
        bv.downloading = false;
        alert('Eroare la descărcarea PDF-ului.');
      }
    });
  }

  viewPdf(bv: BookingView) {
    bv.viewing = true;

    this.api.downloadTicketsPdf(bv.booking.id!).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        this.rawPdfUrl = url;
        this.pdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
        this.showPdfModal = true;

        bv.viewing = false;
      },
      error: () => {
        bv.viewing = false;
        alert('Eroare la vizualizarea PDF-ului.');
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

  closePdf() {
    this.showPdfModal = false;

    if (this.rawPdfUrl) {
      URL.revokeObjectURL(this.rawPdfUrl);
      this.rawPdfUrl = null;
    }

    this.pdfUrl = null;
  }
}
