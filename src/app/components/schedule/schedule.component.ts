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
  templateUrl: './schedule.component.html',
  styleUrl: './schedule.component.scss'
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

  constructor(public api: ApiService, public auth: AuthService) { }

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
