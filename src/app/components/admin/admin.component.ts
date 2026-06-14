import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { forkJoin } from 'rxjs';
import {
  MovieDto, ActorDto, DirectorDto, HallDto, SeatDto, ScreeningDto, BookingDto,
  Genre, GenreLabels, AudioLanguage, AudioLanguageLabels,
  FormatType, FormatTypeLabels, SoundFormat
} from '../../models/models';

type TabType = 'movies' | 'actors' | 'directors' | 'halls' | 'seats' | 'screenings' | 'bookings';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: 'admin.component.html',
  styleUrl: './admin.component.scss'
})
export class AdminComponent implements OnInit {
  activeTab: TabType = 'movies';
  tabList: { key: TabType; label: string }[] = [
    { key: 'movies', label: 'Filme' },
    { key: 'actors', label: 'Actori' },
    { key: 'directors', label: 'Regizori' },
    { key: 'halls', label: 'Săli' },
    // { key: 'seats', label: 'Locuri' },
    { key: 'screenings', label: 'Proiecții' },
    { key: 'bookings', label: 'Rezervări' },
  ];

  movies: MovieDto[] = [];
  actors: ActorDto[] = [];
  directors: DirectorDto[] = [];
  halls: HallDto[] = [];
  seats: SeatDto[] = [];
  screenings: ScreeningDto[] = [];
  bookings: BookingDto[] = [];

  // Form states
  showMovieForm = false;
  editingMovie: MovieDto | null = null;
  mf: any = {};
  movieImage: File | null = null;

  showActorForm = false;
  editingActor: ActorDto | null = null;
  af: any = { name: '' };

  showDirectorForm = false;
  editingDirector: DirectorDto | null = null;
  df: any = { name: '' };

  showHallForm = false;
  editingHall: HallDto | null = null;
  hf: any = { name: '', totalRows: 5, seatsPerRow: 8 };

  showSeatForm = false;
  editingSeat: SeatDto | null = null;
  stf: any = { rowNumber: 1, seatNumber: 1, hallId: 0 };

  showScreeningForm = false;
  editingScreening: ScreeningDto | null = null;
  sf: any = { startTime: '', endTime: '', hallId: 0, movieId: 0 };

  genreKeys = Object.keys(Genre);
  genreLabels = GenreLabels;
  formatKeys = Object.keys(FormatType);
  formatLabels = FormatTypeLabels;
  langKeys = Object.keys(AudioLanguage);
  langLabels = AudioLanguageLabels;

  userEmailMap: Record<number, string> = {};

  constructor(private api: ApiService) {}

  ngOnInit() { this.loadAll(); }

  loadAll() {
    this.api.getMovies(0).subscribe(r => this.movies = r);
    this.api.getActors(0, 1000).subscribe(r => this.actors = r);
    this.api.getDirectors(0, 1000).subscribe(r => this.directors = r);
    this.api.getHalls(0, 1000).subscribe(r => this.halls = r);
    // this.api.getSeats(0, 500).subscribe(r => this.seats = r);
    this.api.getScreenings(0, 1000).subscribe(r => this.screenings = r);
    this.api.getBookings(0, 1000).subscribe(r => {
      this.bookings = r;
      console.log("bookings: ", this.bookings);
      this.loadUserEmails();
      console.log("userEmailMap: ", this.userEmailMap);
    });
  }

  switchTab(tab: TabType) { this.activeTab = tab; }

  // ===== MOVIES =====
  resetMovieForm() {
    this.mf = { title: '', description: '', durationMinutes: 120, ageRestriction: 0, genre: 'ACTION', formatType: 'TWO_D', soundFormat: 'STEREO', releaseDate: '', trailerUrl: '', audioLanguages: [], directorIds: [], actorIds: [] };
    this.movieImage = null;
  }

  editMovie(m: MovieDto) {
    this.editingMovie = m;
    this.mf = {
      ...m,
      audioLanguages: [...(m.audioLanguages || [])],
      directorIds: [...(m.directorIds || [])],
      actorIds: [...(m.actorIds || [])],
    };
    this.showMovieForm = true;
  }

  onImageSelected(event: any) {
    this.movieImage = event.target.files[0] || null;
  }

  toggleLang(lang: string) {
    const idx = this.mf.audioLanguages.indexOf(lang);
    if (idx >= 0) this.mf.audioLanguages.splice(idx, 1);
    else this.mf.audioLanguages.push(lang);
  }

  saveMovie() {
    const dto: MovieDto = { ...this.mf };
    if (this.editingMovie) {
      this.api.updateMovie(this.editingMovie.id!, dto, this.movieImage || undefined).subscribe(() => {
        this.showMovieForm = false;
        this.api.getMovies(0).subscribe(r => this.movies = r);
      });
    } else {
      this.api.createMovie(dto, this.movieImage || undefined).subscribe(() => {
        this.showMovieForm = false;
        this.api.getMovies(0).subscribe(r => this.movies = r);
      });
    }
  }

  deleteMovie(id: number) {
    if (confirm('Sigur vrei să ștergi acest film?')) {
      this.api.deleteMovie(id).subscribe(() => this.movies = this.movies.filter(m => m.id !== id));
    }
  }

  // ===== ACTORS =====
  editActor(a: ActorDto) { this.editingActor = a; this.af = { ...a }; this.showActorForm = true; }
  saveActor() {
    if (this.editingActor) {
      this.api.updateActor(this.editingActor.id!, this.af).subscribe(() => {
        this.showActorForm = false;
        this.api.getActors().subscribe(r => this.actors = r);
      });
    } else {
      this.api.createActor(this.af).subscribe(() => {
        this.showActorForm = false;
        this.api.getActors().subscribe(r => this.actors = r);
      });
    }
  }
  deleteActor(id: number) {
    if (confirm('Sigur?')) this.api.deleteActor(id).subscribe(() => this.actors = this.actors.filter(a => a.id !== id));
  }

  // ===== DIRECTORS =====
  editDirector(d: DirectorDto) { this.editingDirector = d; this.df = { ...d }; this.showDirectorForm = true; }
  saveDirector() {
    if (this.editingDirector) {
      this.api.updateDirector(this.editingDirector.id!, this.df).subscribe(() => {
        this.showDirectorForm = false;
        this.api.getDirectors().subscribe(r => this.directors = r);
      });
    } else {
      this.api.createDirector(this.df).subscribe(() => {
        this.showDirectorForm = false;
        this.api.getDirectors().subscribe(r => this.directors = r);
      });
    }
  }
  deleteDirector(id: number) {
    if (confirm('Sigur?')) this.api.deleteDirector(id).subscribe(() => this.directors = this.directors.filter(d => d.id !== id));
  }

  // ===== HALLS =====
  editHall(h: HallDto) { this.editingHall = h; this.hf = { ...h }; this.showHallForm = true; }
  saveHall() {
    if (this.editingHall) {
      this.api.updateHall(this.editingHall.id!, this.hf).subscribe(() => {
        this.showHallForm = false;
        this.api.getHalls().subscribe(r => this.halls = r);
      });
    } else {
      this.api.createHall(this.hf).subscribe(() => {
        this.showHallForm = false;
        this.api.getHalls().subscribe(r => this.halls = r);
      });
    }
  }
  deleteHall(id: number) {
    if (confirm('Sigur?')) this.api.deleteHall(id).subscribe(() => this.halls = this.halls.filter(h => h.id !== id));
  }

  // ===== SEATS =====
  editSeat(s: SeatDto) { this.editingSeat = s; this.stf = { ...s }; this.showSeatForm = true; }
  saveSeat() {
    if (this.editingSeat) {
      this.api.updateSeat(this.editingSeat.id!, this.stf).subscribe(() => {
        this.showSeatForm = false;
        this.api.getSeats(0, 500).subscribe(r => this.seats = r);
      });
    } else {
      this.api.createSeat(this.stf).subscribe(() => {
        this.showSeatForm = false;
        this.api.getSeats(0, 500).subscribe(r => this.seats = r);
      });
    }
  }
  deleteSeat(id: number) {
    if (confirm('Sigur?')) this.api.deleteSeat(id).subscribe(() => this.seats = this.seats.filter(s => s.id !== id));
  }

  // ===== SCREENINGS =====
  editScreening(s: ScreeningDto) {
    this.editingScreening = s;
    this.sf = { ...s, startTime: this.toDatetimeLocal(s.startTime), endTime: this.toDatetimeLocal(s.endTime) };
    this.showScreeningForm = true;
  }
  saveScreening() {
    const dto: ScreeningDto = { ...this.sf };
    if (this.editingScreening) {
      this.api.updateScreening(this.editingScreening.id!, dto).subscribe(() => {
        this.showScreeningForm = false;
        this.api.getScreenings().subscribe(r => this.screenings = r);
      });
    } else {
      this.api.createScreening(dto).subscribe(() => {
        this.showScreeningForm = false;
        this.api.getScreenings().subscribe(r => this.screenings = r);
      });
    }
  }
  deleteScreening(id: number) {
    if (confirm('Sigur?')) this.api.deleteScreening(id).subscribe(() => this.screenings = this.screenings.filter(s => s.id !== id));
  }

  // ===== BOOKINGS =====
  deleteBooking(id: number) {
    if (confirm('Sigur?')) this.api.deleteBooking(id).subscribe(() => this.bookings = this.bookings.filter(b => b.id !== id));
  }

  // Helpers
  getMovieName(id: number): string { return this.movies.find(m => m.id === id)?.title || `#${id}`; }
  getHallName(id: number): string { return this.halls.find(h => h.id === id)?.name || `#${id}`; }

  formatDateTime(d: string): string {
    if (!d) return '';
    const dt = new Date(d);
    return `${dt.getDate()}.${String(dt.getMonth()+1).padStart(2,'0')}.${dt.getFullYear()} ${String(dt.getHours()).padStart(2,'0')}:${String(dt.getMinutes()).padStart(2,'0')}`;
  }

  private toDatetimeLocal(d: string): string {
    if (!d) return '';
    const dt = new Date(d);
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${dt.getFullYear()}-${pad(dt.getMonth()+1)}-${pad(dt.getDate())}T${pad(dt.getHours())}:${pad(dt.getMinutes())}`;
  }

  toggleDirectorId(id: number) {
    const idx = this.mf.directorIds.indexOf(id);
    if (idx >= 0) this.mf.directorIds.splice(idx, 1);
    else this.mf.directorIds.push(id);
  }

  toggleActorId(id: number) {
    const idx = this.mf.actorIds.indexOf(id);
    if (idx >= 0) this.mf.actorIds.splice(idx, 1);
    else this.mf.actorIds.push(id);
  }

  loadUserEmails() {
    if (!this.bookings || this.bookings.length === 0) return;

    const userIds = [...new Set(this.bookings.map(s => s.userId))];

    console.log("userIds: ", userIds)

    const calls = userIds.map(id => this.api.getUserEmailById(id));

    if (calls.length === 0) return;

    forkJoin(calls).subscribe({
      next: (emails: string[]) => {
        userIds.forEach((id, index) => {
          this.userEmailMap[id] = emails[index];
        });
        console.log('userEmailMap populated:', this.userEmailMap);
      },
      error: (err) => console.error('Eroare la încărcarea emailurilor', err)
    });
  }

}
