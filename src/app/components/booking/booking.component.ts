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
  templateUrl: './booking.component.html',
  styleUrl: './booking.component.scss'
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
  ) { }

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
