import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import {
  MovieDto, MovieSearchDto, ActorDto, DirectorDto,
  Genre, GenreLabels, AudioLanguage, AudioLanguageLabels,
  FormatType, FormatTypeLabels, SoundFormat
} from '../../models/models';

@Component({
  selector: 'app-movies',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="page">
      <div class="container">
        <!-- Hero Banner -->
        <div class="hero-banner animate-in">
          <div class="hero-content">
            <h1 class="page-title">FILME</h1>
            <p class="page-subtitle">Descoperă cele mai recente filme în cinematograful nostru</p>
          </div>
          <div class="hero-glow"></div>
        </div>

        <!-- Search Banner -->
        <div class="search-banner animate-in" style="animation-delay: 0.1s">
          <div class="search-header">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            <span>Filtrează filme</span>
            @if (hasActiveFilters()) {
              <button class="clear-filters" (click)="clearFilters()">✕ Șterge filtre</button>
            }
          </div>
          <div class="search-filters">
            <div class="filter-group">
              <label>Actor</label>
              <select class="form-control" [(ngModel)]="selectedActorId" (change)="onSearch()">
                <option [ngValue]="null">Toți actorii</option>
                @for (actor of actors; track actor.id) {
                  <option [ngValue]="actor.id">{{ actor.name }}</option>
                }
              </select>
            </div>
            <div class="filter-group">
              <label>Director</label>
              <select class="form-control" [(ngModel)]="selectedDirectorId" (change)="onSearch()">
                <option [ngValue]="null">Toți directorii</option>
                @for (director of directors; track director.id) {
                  <option [ngValue]="director.id">{{ director.name }}</option>
                }
              </select>
            </div>
            <div class="filter-group">
              <label>Sunet</label>
              <select class="form-control" [(ngModel)]="selectedSound" (change)="onSearch()">
                <option [ngValue]="null">Orice sunet</option>
                <option value="MONO">Mono</option>
                <option value="STEREO">Stereo</option>
                <option value="SURROUND">Surround</option>
              </select>
            </div>
            <div class="filter-group">
              <label>Format</label>
              <select class="form-control" [(ngModel)]="selectedFormat" (change)="onSearch()">
                <option [ngValue]="null">Orice format</option>
                @for (f of formatKeys; track f) {
                  <option [value]="f">{{ formatLabels[f] }}</option>
                }
              </select>
            </div>
            <div class="filter-group">
              <label>Limba</label>
              <select class="form-control" [(ngModel)]="selectedLang" (change)="onSearch()">
                <option [ngValue]="null">Orice limbă</option>
                @for (l of langKeys; track l) {
                  <option [value]="l">{{ langLabels[l] }}</option>
                }
              </select>
            </div>
            <div class="filter-group">
              <label>Gen</label>
              <select class="form-control" [(ngModel)]="selectedGenre" (change)="onSearch()">
                <option [ngValue]="null">Orice gen</option>
                @for (g of genreKeys; track g) {
                  <option [value]="g">{{ genreLabels[g] }}</option>
                }
              </select>
            </div>
          </div>
        </div>

        <!-- Movies Grid -->
        @if (loading) {
          <div class="loading-container"><div class="spinner"></div></div>
        } @else if (movies.length === 0) {
          <div class="empty-state animate-in">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" stroke-width="1.5"><rect x="2" y="2" width="20" height="20" rx="2.18"/><line x1="7" y1="2" x2="7" y2="22"/><line x1="17" y1="2" x2="17" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/></svg>
            <h3>Nu s-au găsit filme</h3>
            <p>Încearcă să modifici filtrele de căutare</p>
          </div>
        } @else {
          <div class="movies-grid">
            @for (movie of movies; track movie.id; let i = $index) {
              <a [routerLink]="['/movies', movie.id]" class="movie-card animate-in" [style.animation-delay]="(i * 0.05) + 's'">
                <div class="movie-poster">
                  @if (movie.imagePath) {
                    <img [src]="api.getMovieImageUrl(movie.imagePath)" [alt]="movie.title" loading="lazy">
                  } @else {
                    <div class="poster-placeholder">
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="2" width="20" height="20" rx="2.18"/><line x1="7" y1="2" x2="7" y2="22"/><line x1="17" y1="2" x2="17" y2="22"/></svg>
                    </div>
                  }
                  <div class="poster-overlay">
                    <span class="play-icon">▶</span>
                  </div>
                  <div class="movie-badges">
                    <span class="badge badge-accent">{{ formatLabels[movie.formatType] || movie.formatType }}</span>
                    @if (movie.ageRestriction) {
                      <span class="badge badge-info">{{ movie.ageRestriction }}+</span>
                    }
                  </div>
                </div>
                <div class="movie-info">
                  <h3 class="movie-title">{{ movie.title }}</h3>
                  <div class="movie-meta">
                    <span>{{ genreLabels[movie.genre] || movie.genre }}</span>
                    <span class="dot">·</span>
                    <span>{{ movie.durationMinutes }} min</span>
                  </div>
                  <div class="movie-langs">
                    @for (lang of movie.audioLanguages; track lang) {
                      <span class="lang-tag">{{ langLabels[lang] || lang }}</span>
                    }
                  </div>
                </div>
              </a>
            }
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .hero-banner {
      position: relative;
      padding: 50px 40px;
      border-radius: var(--radius-xl);
      background: linear-gradient(135deg, var(--bg-secondary) 0%, var(--bg-card) 100%);
      border: 1px solid var(--border);
      margin-bottom: 28px;
      overflow: hidden;
    }
    .hero-content { position: relative; z-index: 2; }
    .hero-glow {
      position: absolute;
      top: -60%;
      right: -20%;
      width: 400px;
      height: 400px;
      background: radial-gradient(circle, var(--accent-glow) 0%, transparent 70%);
      pointer-events: none;
    }

    .search-banner {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      padding: 24px;
      margin-bottom: 36px;
    }
    .search-header {
      display: flex;
      align-items: center;
      gap: 10px;
      color: var(--text-secondary);
      font-size: 0.9rem;
      font-weight: 500;
      margin-bottom: 18px;
    }
    .clear-filters {
      margin-left: auto;
      background: none;
      border: none;
      color: var(--accent);
      font-size: 0.82rem;
      cursor: pointer;
      font-family: var(--font-body);
    }
    .search-filters {
      display: grid;
      grid-template-columns: repeat(6, 1fr);
      gap: 14px;
    }
    .filter-group label {
      display: block;
      margin-bottom: 6px;
      font-size: 0.72rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: var(--text-muted);
    }

    .movies-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 24px;
    }

    .movie-card {
      text-decoration: none;
      color: inherit;
      border-radius: var(--radius-lg);
      overflow: hidden;
      background: var(--bg-card);
      border: 1px solid var(--border);
      transition: all var(--transition);
    }
    .movie-card:hover {
      border-color: var(--accent);
      transform: translateY(-6px);
      box-shadow: var(--shadow-accent);
    }

    .movie-poster {
      position: relative;
      aspect-ratio: 2/3;
      overflow: hidden;
      background: var(--bg-secondary);
    }
    .movie-poster img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform var(--transition-slow);
    }
    .movie-card:hover .movie-poster img {
      transform: scale(1.08);
    }
    .poster-placeholder {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--text-muted);
      background: linear-gradient(135deg, var(--bg-secondary), var(--bg-card));
    }
    .poster-overlay {
      position: absolute;
      inset: 0;
      background: linear-gradient(to top, rgba(10,10,15,0.9) 0%, transparent 50%);
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      transition: opacity var(--transition);
    }
    .movie-card:hover .poster-overlay { opacity: 1; }
    .play-icon {
      width: 54px;
      height: 54px;
      background: var(--accent);
      color: var(--bg-primary);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
      transform: translateY(10px);
      transition: transform var(--transition);
    }
    .movie-card:hover .play-icon { transform: translateY(0); }

    .movie-badges {
      position: absolute;
      top: 12px;
      left: 12px;
      display: flex;
      gap: 6px;
    }

    .movie-info {
      padding: 16px;
    }
    .movie-title {
      font-family: var(--font-display);
      font-size: 1.2rem;
      letter-spacing: 1px;
      margin-bottom: 6px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .movie-meta {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 0.8rem;
      color: var(--text-muted);
      margin-bottom: 10px;
    }
    .dot { opacity: 0.4; }
    .movie-langs {
      display: flex;
      gap: 6px;
      flex-wrap: wrap;
    }
    .lang-tag {
      font-size: 0.7rem;
      padding: 3px 8px;
      background: var(--bg-secondary);
      border-radius: 4px;
      color: var(--text-secondary);
      border: 1px solid var(--border);
    }

    .empty-state {
      text-align: center;
      padding: 80px 20px;
      color: var(--text-muted);
    }
    .empty-state h3 {
      margin-top: 16px;
      font-size: 1.5rem;
      color: var(--text-secondary);
    }
    .empty-state p { margin-top: 8px; }

    @media (max-width: 1024px) {
      .movies-grid { grid-template-columns: repeat(3, 1fr); }
      .search-filters { grid-template-columns: repeat(3, 1fr); }
    }
    @media (max-width: 768px) {
      .movies-grid { grid-template-columns: repeat(2, 1fr); }
      .search-filters { grid-template-columns: repeat(2, 1fr); }
      .hero-banner { padding: 30px 24px; }
    }
    @media (max-width: 480px) {
      .movies-grid { grid-template-columns: 1fr; }
      .search-filters { grid-template-columns: 1fr; }
    }
  `]
})
export class MoviesComponent implements OnInit {
  movies: MovieDto[] = [];
  actors: ActorDto[] = [];
  directors: DirectorDto[] = [];
  loading = true;

  selectedActorId: number | null = null;
  selectedDirectorId: number | null = null;
  selectedSound: string | null = null;
  selectedFormat: string | null = null;
  selectedLang: string | null = null;
  selectedGenre: string | null = null;

  genreKeys = Object.keys(Genre);
  genreLabels = GenreLabels;
  langKeys = Object.keys(AudioLanguage);
  langLabels = AudioLanguageLabels;
  formatKeys = Object.keys(FormatType);
  formatLabels = FormatTypeLabels;

  constructor(public api: ApiService) {}

  ngOnInit() {
    this.api.getActors().subscribe(a => this.actors = a);
    this.api.getDirectors().subscribe(d => this.directors = d);
    this.loadMovies();
  }

  loadMovies() {
    this.loading = true;
    this.api.getMovies().subscribe({
      next: movies => { this.movies = movies; this.loading = false; },
      error: () => this.loading = false
    });
  }

  onSearch() {
    if (!this.hasActiveFilters()) {
      this.loadMovies();
      return;
    }

    const search: MovieSearchDto = {};
    if (this.selectedActorId) search.actorIds = [this.selectedActorId];
    if (this.selectedDirectorId) search.directorIds = [this.selectedDirectorId];
    if (this.selectedSound) search.soundFormat = this.selectedSound as SoundFormat;
    if (this.selectedFormat) search.formatType = this.selectedFormat as FormatType;
    if (this.selectedLang) search.audioLanguage = this.selectedLang as AudioLanguage;
    if (this.selectedGenre) search.genre = this.selectedGenre as Genre;

    this.loading = true;
    this.api.searchMovies(search).subscribe({
      next: (result: any) => {
        this.movies = result.content || result;
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  hasActiveFilters(): boolean {
    return !!(this.selectedActorId || this.selectedDirectorId || this.selectedSound ||
              this.selectedFormat || this.selectedLang || this.selectedGenre);
  }

  clearFilters() {
    this.selectedActorId = null;
    this.selectedDirectorId = null;
    this.selectedSound = null;
    this.selectedFormat = null;
    this.selectedLang = null;
    this.selectedGenre = null;
    this.loadMovies();
  }
}
