import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { MovieDto, ScreeningDto, GenreLabels, FormatTypeLabels } from '../../models/models';

@Component({
  selector: 'app-schedule',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="page">
      <div class="container">
        <div class="hero-banner animate-in">
          <h1 class="page-title">PROGRAM</h1>
          <p class="page-subtitle">Alege o zi pentru a vedea filmele disponibile</p>
        </div>

        <!-- Day selector -->
        <div class="day-selector animate-in" style="animation-delay: 0.1s">
          @for (day of days; track day.label; let i = $index) {
            <button class="day-btn" [class.active]="selectedDay === i" (click)="selectDay(i)">
              <span class="day-name">{{ day.label }}</span>
              <span class="day-date">{{ day.dateShort }}</span>
            </button>
          }
        </div>

        @if (loading) {
          <div class="loading-container"><div class="spinner"></div></div>
        } @else if (screeningsForDay.length === 0) {
          <div class="empty-state animate-in">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" stroke-width="1.5"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            <h3>Niciun film programat</h3>
            <p>Nu există proiecții pentru această zi</p>
          </div>
        } @else {
          <div class="schedule-list">
            @for (item of screeningsForDay; track item.screening.id; let i = $index) {
              <div class="schedule-card animate-in" [style.animation-delay]="(i * 0.08) + 's'">
                <a [routerLink]="['/movies', item.movie.id]" class="schedule-poster">
                  @if (item.movie.imagePath) {
                    <img [src]="api.getMovieImageUrl(item.movie.imagePath)" [alt]="item.movie.title">
                  } @else {
                    <div class="poster-sm-placeholder">
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="2" width="20" height="20" rx="2"/></svg>
                    </div>
                  }
                </a>

                <div class="schedule-info">
                  <div class="schedule-top">
                    <a [routerLink]="['/movies', item.movie.id]" class="schedule-title">{{ item.movie.title }}</a>
                    <div class="schedule-meta">
                      <span class="badge badge-accent">{{ formatLabels[item.movie.formatType] || item.movie.formatType }}</span>
                      <span>{{ genreLabels[item.movie.genre] || item.movie.genre }}</span>
                      <span class="dot">·</span>
                      <span>{{ item.movie.durationMinutes }} min</span>
                    </div>
                  </div>
                  <div class="schedule-time">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                    <span class="time-value">{{ formatTime(item.screening.startTime) }}</span>
                    <span class="time-sep">→</span>
                    <span class="time-value">{{ formatTime(item.screening.endTime) }}</span>
                  </div>
                </div>

                <div class="schedule-action">
                  <a [routerLink]="['/booking', item.screening.id]" class="btn btn-primary">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 5v2M9 5v2M4 11h16M4 7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7z"/><path d="M9 16h6"/></svg>
                    Rezervă
                  </a>
                </div>
              </div>
            }
          </div>
        }
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

    .day-selector {
      display: flex;
      gap: 8px;
      margin-bottom: 32px;
      overflow-x: auto;
      padding-bottom: 4px;
    }
    .day-btn {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 14px 22px;
      background: var(--bg-card);
      border: 1.5px solid var(--border);
      border-radius: var(--radius-md);
      cursor: pointer;
      transition: all var(--transition);
      min-width: 90px;
      font-family: var(--font-body);
    }
    .day-btn:hover {
      border-color: var(--accent);
      background: var(--accent-dim);
    }
    .day-btn.active {
      background: var(--accent);
      border-color: var(--accent);
    }
    .day-btn.active .day-name,
    .day-btn.active .day-date { color: var(--bg-primary); }
    .day-name {
      font-size: 0.72rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: var(--text-muted);
      margin-bottom: 4px;
    }
    .day-date {
      font-size: 1.1rem;
      font-weight: 600;
      color: var(--text-primary);
    }

    .schedule-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .schedule-card {
      display: flex;
      align-items: center;
      gap: 24px;
      padding: 20px;
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      transition: all var(--transition);
    }
    .schedule-card:hover {
      border-color: var(--border-light);
      box-shadow: var(--shadow-md);
    }

    .schedule-poster {
      width: 80px;
      height: 110px;
      border-radius: var(--radius-sm);
      overflow: hidden;
      flex-shrink: 0;
      background: var(--bg-secondary);
    }
    .schedule-poster img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .poster-sm-placeholder {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--text-muted);
    }

    .schedule-info { flex: 1; }
    .schedule-title {
      font-family: var(--font-display);
      font-size: 1.4rem;
      letter-spacing: 1px;
      color: var(--text-primary);
      text-decoration: none;
      transition: color var(--transition);
    }
    .schedule-title:hover { color: var(--accent); }
    .schedule-meta {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 0.82rem;
      color: var(--text-muted);
      margin-top: 6px;
    }
    .schedule-time {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-top: 14px;
    }
    .time-value {
      font-size: 1.1rem;
      font-weight: 600;
      color: var(--text-primary);
      font-family: var(--font-display);
      letter-spacing: 1px;
    }
    .time-sep { color: var(--text-muted); }

    .schedule-action { flex-shrink: 0; }

    .empty-state {
      text-align: center;
      padding: 80px 20px;
      color: var(--text-muted);
    }
    .empty-state h3 { margin-top: 16px; color: var(--text-secondary); }
    .empty-state p { margin-top: 8px; }
    .dot { opacity: 0.4; }

    @media (max-width: 768px) {
      .schedule-card {
        flex-direction: column;
        align-items: flex-start;
        gap: 16px;
      }
      .schedule-poster { width: 100%; height: 200px; }
      .schedule-action { width: 100%; }
      .schedule-action .btn { width: 100%; }
    }
  `]
})
export class ScheduleComponent implements OnInit {
  days: { label: string; dateShort: string; start: string; end: string }[] = [];
  selectedDay = 0;
  screenings: ScreeningDto[] = [];
  movies: Map<number, MovieDto> = new Map();
  screeningsForDay: { screening: ScreeningDto; movie: MovieDto }[] = [];
  loading = true;

  genreLabels = GenreLabels;
  formatLabels = FormatTypeLabels;

  constructor(public api: ApiService, public auth: AuthService) {}

  ngOnInit() {
    this.buildDays();
    this.loadScreenings();
  }

  private buildDays() {
    const dayNames = ['Dum', 'Lun', 'Mar', 'Mie', 'Joi', 'Vin', 'Sâm'];
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      this.days.push({
        label: i === 0 ? 'Azi' : dayNames[d.getDay()],
        dateShort: `${d.getDate()}.${String(d.getMonth() + 1).padStart(2, '0')}`,
        start: this.toLocalDateTime(d, 0, 0),
        end: this.toLocalDateTime(d, 23, 59)
      });
    }
  }

  selectDay(i: number) {
    this.selectedDay = i;
    this.loadScreenings();
  }

  private loadScreenings() {
    this.loading = true;
    const day = this.days[this.selectedDay];
    this.api.getMoviesByScreening({ startDate: day.start, endDate: day.end }).subscribe({
      next: movies => {
        // Also load screenings to pair them
        this.api.getScreenings(0, 200).subscribe({
          next: screenings => {
            this.screeningsForDay = [];
            const dayStart = new Date(day.start).getTime();
            const dayEnd = new Date(day.end).getTime();

            for (const s of screenings) {
              const sTime = new Date(s.startTime).getTime();
              if (sTime >= dayStart && sTime <= dayEnd) {
                const movie = movies.find(m => m.id === s.movieId);
                if (movie) {
                  this.screeningsForDay.push({ screening: s, movie });
                }
              }
            }
            this.screeningsForDay.sort((a, b) =>
              new Date(a.screening.startTime).getTime() - new Date(b.screening.startTime).getTime()
            );
            this.loading = false;
          },
          error: () => this.loading = false
        });
      },
      error: () => this.loading = false
    });
  }

  formatTime(dateStr: string): string {
    const d = new Date(dateStr);
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  }

  private toLocalDateTime(date: Date, hours: number, minutes: number): string {
    const d = new Date(date);
    d.setHours(hours, minutes, 0, 0);
    return d.toISOString().replace('Z', '');
  }
}
