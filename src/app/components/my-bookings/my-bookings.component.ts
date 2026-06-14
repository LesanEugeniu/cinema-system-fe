import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { BookingDto, MovieDto, ScreeningDto, HallDto, GenreLabels, FormatTypeLabels } from '../../models/models';
import { forkJoin } from 'rxjs';
import { DomSanitizer, SafeResourceUrl } from "@angular/platform-browser";

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
  templateUrl: './my-bookings.component.html',
  styleUrl: './my-bookings.component.scss'
})
export class MyBookingsComponent implements OnInit {
  bookingViews: BookingView[] = [];
  loading = true;

  genreLabels = GenreLabels;
  formatLabels = FormatTypeLabels;

  pdfUrl: SafeResourceUrl | null = null;
  private rawPdfUrl: string | null = null;
  showPdfModal = false;

  constructor(public api: ApiService, private sanitizer: DomSanitizer) { }

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
