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
  template: `
    <div class="page">
      <div class="container">
        <h1 class="page-title animate-in">PANOU ADMIN</h1>
        <p class="page-subtitle animate-in">Gestionează entitățile sistemului cinema</p>

        <!-- Tabs -->
        <div class="tabs animate-in" style="animation-delay: 0.1s">
          @for (t of tabList; track t.key) {
            <button class="tab" [class.active]="activeTab === t.key" (click)="switchTab(t.key)">
              {{ t.label }}
            </button>
          }
        </div>

        <!-- ========== MOVIES ========== -->
        @if (activeTab === 'movies') {
          <div class="admin-section animate-in">
            <div class="section-header">
              <h2>Filme ({{ movies.length }})</h2>
              <button class="btn btn-primary btn-sm" (click)="showMovieForm = true; editingMovie = null; resetMovieForm()">+ Adaugă Film</button>
            </div>

            @if (showMovieForm) {
              <div class="form-card">
                <h3>{{ editingMovie ? 'Editează Film' : 'Film Nou' }}</h3>
                <div class="form-grid">
                  <div class="form-group"><label>Titlu</label><input class="form-control" [(ngModel)]="mf.title"></div>
                  <div class="form-group"><label>Durată (min)</label><input type="number" class="form-control" [(ngModel)]="mf.durationMinutes"></div>
                  <div class="form-group"><label>Restricție vârstă</label><input type="number" class="form-control" [(ngModel)]="mf.ageRestriction"></div>
                  <div class="form-group">
                    <label>Regizori</label>
                    <div class="checkbox-scroll">
                      @for (d of directors; track d.id) {
                        <label class="check-label">
                          <input type="checkbox"
                                 [checked]="mf.directorIds?.includes(d.id)"
                                 (change)="toggleDirectorId(d.id!)">
                          {{ d.name }}
                        </label>
                      }
                    </div>
                  </div>
                  <div class="form-group">
                    <label>Actori</label>
                    <div class="checkbox-scroll">
                      @for (a of actors; track a.id) {
                        <label class="check-label">
                          <input type="checkbox"
                                 [checked]="mf.actorIds?.includes(a.id)"
                                 (change)="toggleActorId(a.id!)">
                          {{ a.name }}
                        </label>
                      }
                    </div>
                  </div>
                  <div class="form-group">
                    <label>Gen</label>
                    <select class="form-control" [(ngModel)]="mf.genre">
                      @for (g of genreKeys; track g) { <option [value]="g">{{ genreLabels[g] }}</option> }
                    </select>
                  </div>
                  <div class="form-group">
                    <label>Format</label>
                    <select class="form-control" [(ngModel)]="mf.formatType">
                      @for (f of formatKeys; track f) { <option [value]="f">{{ formatLabels[f] }}</option> }
                    </select>
                  </div>
                  <div class="form-group">
                    <label>Sunet</label>
                    <select class="form-control" [(ngModel)]="mf.soundFormat">
                      <option value="MONO">Mono</option>
                      <option value="STEREO">Stereo</option>
                      <option value="SURROUND">Surround</option>
                    </select>
                  </div>
                  <div class="form-group"><label>Data lansării</label><input type="date" class="form-control" [(ngModel)]="mf.releaseDate"></div>
                  <div class="form-group"><label>Trailer URL</label><input class="form-control" [(ngModel)]="mf.trailerUrl"></div>
                </div>
                <div class="form-group"><label>Descriere</label><textarea class="form-control" rows="3" [(ngModel)]="mf.description"></textarea></div>
                <div class="form-grid">
                  <div class="form-group">
                    <label>Limbi audio</label>
                    <div class="checkbox-row">
                      @for (l of langKeys; track l) {
                        <label class="check-label"><input type="checkbox" [checked]="mf.audioLanguages.includes(l)" (change)="toggleLang(l)"> {{ langLabels[l] }}</label>
                      }
                    </div>
                  </div>
                  <div class="form-group">
                    <label>Imagine</label>
                    <input type="file" accept="image/*" class="form-control" (change)="onImageSelected($event)">
                  </div>
                </div>
                <div class="form-actions">
                  <button class="btn btn-secondary btn-sm" (click)="showMovieForm = false">Anulează</button>
                  <button class="btn btn-primary btn-sm" (click)="saveMovie()">{{ editingMovie ? 'Salvează' : 'Creează' }}</button>
                </div>
              </div>
            }

            <div class="table-container">
              <table>
                <thead><tr><th>ID</th><th>Titlu</th><th>Gen</th><th>Durată</th><th>Format</th><th>Acțiuni</th></tr></thead>
                <tbody>
                  @for (m of movies; track m.id) {
                    <tr>
                      <td>{{ m.id }}</td>
                      <td><strong>{{ m.title }}</strong></td>
                      <td>{{ genreLabels[m.genre] || m.genre }}</td>
                      <td>{{ m.durationMinutes }} min</td>
                      <td><span class="badge badge-accent">{{ formatLabels[m.formatType] || m.formatType }}</span></td>
                      <td class="actions-cell">
                        <button class="btn btn-icon" (click)="editMovie(m)">✏️</button>
                        <button class="btn btn-icon" (click)="deleteMovie(m.id!)">🗑️</button>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>
        }

        <!-- ========== ACTORS ========== -->
        @if (activeTab === 'actors') {
          <div class="admin-section animate-in">
            <div class="section-header">
              <h2>Actori ({{ actors.length }})</h2>
              <button class="btn btn-primary btn-sm" (click)="showActorForm = true; editingActor = null; af = {name:''}">+ Adaugă Actor</button>
            </div>
            @if (showActorForm) {
              <div class="form-card">
                <h3>{{ editingActor ? 'Editează Actor' : 'Actor Nou' }}</h3>
                <div class="form-group"><label>Nume</label><input class="form-control" [(ngModel)]="af.name"></div>
                <div class="form-actions">
                  <button class="btn btn-secondary btn-sm" (click)="showActorForm = false">Anulează</button>
                  <button class="btn btn-primary btn-sm" (click)="saveActor()">{{ editingActor ? 'Salvează' : 'Creează' }}</button>
                </div>
              </div>
            }
            <div class="table-container">
              <table>
                <thead><tr><th>ID</th><th>Nume</th><th>Acțiuni</th></tr></thead>
                <tbody>
                  @for (a of actors; track a.id) {
                    <tr>
                      <td>{{ a.id }}</td><td>{{ a.name }}</td>
                      <td class="actions-cell">
                        <button class="btn btn-icon" (click)="editActor(a)">✏️</button>
                        <button class="btn btn-icon" (click)="deleteActor(a.id!)">🗑️</button>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>
        }

        <!-- ========== DIRECTORS ========== -->
        @if (activeTab === 'directors') {
          <div class="admin-section animate-in">
            <div class="section-header">
              <h2>Regizori ({{ directors.length }})</h2>
              <button class="btn btn-primary btn-sm" (click)="showDirectorForm = true; editingDirector = null; df = {name:''}">+ Adaugă Regizor</button>
            </div>
            @if (showDirectorForm) {
              <div class="form-card">
                <h3>{{ editingDirector ? 'Editează Regizor' : 'Regizor Nou' }}</h3>
                <div class="form-group"><label>Nume</label><input class="form-control" [(ngModel)]="df.name"></div>
                <div class="form-actions">
                  <button class="btn btn-secondary btn-sm" (click)="showDirectorForm = false">Anulează</button>
                  <button class="btn btn-primary btn-sm" (click)="saveDirector()">{{ editingDirector ? 'Salvează' : 'Creează' }}</button>
                </div>
              </div>
            }
            <div class="table-container">
              <table>
                <thead><tr><th>ID</th><th>Nume</th><th>Acțiuni</th></tr></thead>
                <tbody>
                  @for (d of directors; track d.id) {
                    <tr>
                      <td>{{ d.id }}</td><td>{{ d.name }}</td>
                      <td class="actions-cell">
                        <button class="btn btn-icon" (click)="editDirector(d)">✏️</button>
                        <button class="btn btn-icon" (click)="deleteDirector(d.id!)">🗑️</button>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>
        }

        <!-- ========== HALLS ========== -->
        @if (activeTab === 'halls') {
          <div class="admin-section animate-in">
            <div class="section-header">
              <h2>Săli ({{ halls.length }})</h2>
              <button class="btn btn-primary btn-sm" (click)="showHallForm = true; editingHall = null; hf = {name:'',totalRows:5,seatsPerRow:8}">+ Adaugă Sală</button>
            </div>
            @if (showHallForm) {
              <div class="form-card">
                <h3>{{ editingHall ? 'Editează Sală' : 'Sală Nouă' }}</h3>
                <div class="form-grid">
                  <div class="form-group"><label>Nume</label><input class="form-control" [(ngModel)]="hf.name"></div>
                  <div class="form-group"><label>Rânduri</label><input type="number" class="form-control" [(ngModel)]="hf.totalRows"></div>
                  <div class="form-group"><label>Locuri/rând</label><input type="number" class="form-control" [(ngModel)]="hf.seatsPerRow"></div>
                </div>
                <div class="form-actions">
                  <button class="btn btn-secondary btn-sm" (click)="showHallForm = false">Anulează</button>
                  <button class="btn btn-primary btn-sm" (click)="saveHall()">{{ editingHall ? 'Salvează' : 'Creează' }}</button>
                </div>
              </div>
            }
            <div class="table-container">
              <table>
                <thead><tr><th>ID</th><th>Nume</th><th>Rânduri</th><th>Locuri/rând</th><th>Acțiuni</th></tr></thead>
                <tbody>
                  @for (h of halls; track h.id) {
                    <tr>
                      <td>{{ h.id }}</td><td>{{ h.name }}</td><td>{{ h.totalRows }}</td><td>{{ h.seatsPerRow }}</td>
                      <td class="actions-cell">
                        <button class="btn btn-icon" (click)="editHall(h)">✏️</button>
                        <button class="btn btn-icon" (click)="deleteHall(h.id!)">🗑️</button>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>
        }

        <!-- ========== SEATS ========== -->
        @if (activeTab === 'seats') {
          <div class="admin-section animate-in">
            <div class="section-header">
              <h2>Locuri ({{ seats.length }})</h2>
              <button class="btn btn-primary btn-sm" (click)="showSeatForm = true; editingSeat = null; stf = {rowNumber:1,seatNumber:1,hallId:0}">+ Adaugă Loc</button>
            </div>
            @if (showSeatForm) {
              <div class="form-card">
                <h3>{{ editingSeat ? 'Editează Loc' : 'Loc Nou' }}</h3>
                <div class="form-grid">
                  <div class="form-group">
                    <label>Sala</label>
                    <select class="form-control" [(ngModel)]="stf.hallId">
                      <option [ngValue]="0" disabled>Alege sala</option>
                      @for (h of halls; track h.id) { <option [ngValue]="h.id">{{ h.name }}</option> }
                    </select>
                  </div>
                  <div class="form-group"><label>Rând</label><input type="number" class="form-control" [(ngModel)]="stf.rowNumber"></div>
                  <div class="form-group"><label>Număr loc</label><input type="number" class="form-control" [(ngModel)]="stf.seatNumber"></div>
                </div>
                <div class="form-actions">
                  <button class="btn btn-secondary btn-sm" (click)="showSeatForm = false">Anulează</button>
                  <button class="btn btn-primary btn-sm" (click)="saveSeat()">{{ editingSeat ? 'Salvează' : 'Creează' }}</button>
                </div>
              </div>
            }
            <div class="table-container">
              <table>
                <thead><tr><th>ID</th><th>Sala</th><th>Rând</th><th>Loc</th><th>Acțiuni</th></tr></thead>
                <tbody>
                  @for (s of seats; track s.id) {
                    <tr>
                      <td>{{ s.id }}</td>
                      <td>{{ getHallName(s.hallId) }}</td>
                      <td>{{ s.rowNumber }}</td>
                      <td>{{ s.seatNumber }}</td>
                      <td class="actions-cell">
                        <button class="btn btn-icon" (click)="editSeat(s)">✏️</button>
                        <button class="btn btn-icon" (click)="deleteSeat(s.id!)">🗑️</button>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>
        }

        <!-- ========== SCREENINGS ========== -->
        @if (activeTab === 'screenings') {
          <div class="admin-section animate-in">
            <div class="section-header">
              <h2>Proiecții ({{ screenings.length }})</h2>
              <button class="btn btn-primary btn-sm" (click)="showScreeningForm = true; editingScreening = null; sf = {startTime:'',endTime:'',hallId:0,movieId:0}">+ Adaugă Proiecție</button>
            </div>
            @if (showScreeningForm) {
              <div class="form-card">
                <h3>{{ editingScreening ? 'Editează Proiecție' : 'Proiecție Nouă' }}</h3>
                <div class="form-grid">
                  <div class="form-group">
                    <label>Film</label>
                    <select class="form-control" [(ngModel)]="sf.movieId">
                      <option [ngValue]="0" disabled>Alege filmul</option>
                      @for (m of movies; track m.id) { <option [ngValue]="m.id">{{ m.title }}</option> }
                    </select>
                  </div>
                  <div class="form-group">
                    <label>Sala</label>
                    <select class="form-control" [(ngModel)]="sf.hallId">
                      <option [ngValue]="0" disabled>Alege sala</option>
                      @for (h of halls; track h.id) { <option [ngValue]="h.id">{{ h.name }}</option> }
                    </select>
                  </div>
                  <div class="form-group"><label>Început</label><input type="datetime-local" class="form-control" [(ngModel)]="sf.startTime"></div>
                  <div class="form-group"><label>Sfârșit</label><input type="datetime-local" class="form-control" [(ngModel)]="sf.endTime"></div>
                </div>
                <div class="form-actions">
                  <button class="btn btn-secondary btn-sm" (click)="showScreeningForm = false">Anulează</button>
                  <button class="btn btn-primary btn-sm" (click)="saveScreening()">{{ editingScreening ? 'Salvează' : 'Creează' }}</button>
                </div>
              </div>
            }
            <div class="table-container">
              <table>
                <thead><tr><th>ID</th><th>Film</th><th>Sala</th><th>Început</th><th>Sfârșit</th><th>Acțiuni</th></tr></thead>
                <tbody>
                  @for (s of screenings; track s.id) {
                    <tr>
                      <td>{{ s.id }}</td>
                      <td>{{ getMovieName(s.movieId) }}</td>
                      <td>{{ getHallName(s.hallId) }}</td>
                      <td>{{ formatDateTime(s.startTime) }}</td>
                      <td>{{ formatDateTime(s.endTime) }}</td>
                      <td class="actions-cell">
                        <button class="btn btn-icon" (click)="editScreening(s)">✏️</button>
                        <button class="btn btn-icon" (click)="deleteScreening(s.id!)">🗑️</button>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>
        }

        <!-- ========== BOOKINGS ========== -->
        @if (activeTab === 'bookings') {
          <div class="admin-section animate-in">
            <div class="section-header">
              <h2>Rezervări ({{ bookings.length }})</h2>
            </div>
            <div class="table-container">
              <table>
                <thead><tr><th>ID</th><th>User Email</th><th>Proiecție</th><th>Locuri</th><th>Preț</th><th>Data</th><th>Acțiuni</th></tr></thead>
                <tbody>
                  @for (b of bookings; track b.id) {
                    <tr>
                      <td>{{ b.id }}</td>
                      <td>{{ userEmailMap[b.userId] }}</td>
                      <td>{{ b.screeningId }}</td>
                      <td>{{ b.seatIds?.join(', ') }}</td>
                      <td>{{ b.totalPrice }} MDL</td>
                      <td>{{ formatDateTime(b.bookingDate) }}</td>
                      <td class="actions-cell">
                        <button class="btn btn-icon" (click)="deleteBooking(b.id!)">🗑️</button>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .admin-section { margin-bottom: 40px; }
    .section-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 20px;
    }
    .section-header h2 {
      font-family: var(--font-display);
      font-size: 1.5rem;
      letter-spacing: 2px;
    }

    .form-card {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      padding: 28px;
      margin-bottom: 24px;
    }
    .form-card h3 {
      font-family: var(--font-display);
      font-size: 1.2rem;
      letter-spacing: 2px;
      margin-bottom: 20px;
    }
    .form-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 16px;
    }
    .form-actions {
      display: flex;
      gap: 12px;
      justify-content: flex-end;
      margin-top: 20px;
    }
    .checkbox-row {
      display: flex;
      gap: 18px;
      flex-wrap: wrap;
      margin-top: 6px;
    }
    .check-label {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 0.88rem;
      color: var(--text-secondary);
      cursor: pointer;
    }
    .check-label input[type="checkbox"] {
      accent-color: var(--accent);
    }
    .actions-cell {
      display: flex;
      gap: 6px;
    }

    .checkbox-scroll {
      display: flex;
      flex-direction: column;
      gap: 8px;
      max-height: 160px;
      overflow-y: auto;
      border: 1px solid var(--border);
      border-radius: var(--radius);
      padding: 10px 12px;
      background: var(--bg-input, var(--bg-card));
    }

    .checkbox-scroll .check-label {
      flex-shrink: 0;
    }
    
    @media (max-width: 768px) {
      .form-grid { grid-template-columns: 1fr; }
    }
  `]
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
    this.api.getMovies(0, 1000).subscribe(r => this.movies = r);
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
        this.api.getMovies(0, 100).subscribe(r => this.movies = r);
      });
    } else {
      this.api.createMovie(dto, this.movieImage || undefined).subscribe(() => {
        this.showMovieForm = false;
        this.api.getMovies(0, 100).subscribe(r => this.movies = r);
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
