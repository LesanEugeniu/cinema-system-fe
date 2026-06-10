import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ApiService } from '../../services/api.service';
import { MovieDto, ActorDto, DirectorDto, GenreLabels, AudioLanguageLabels, FormatTypeLabels } from '../../models/models';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-movie-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="page">
      @if (loading) {
        <div class="loading-container"><div class="spinner"></div></div>
      } @else if (movie) {
        <div class="container">
          <a routerLink="/movies" class="back-link animate-in">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m15 18-6-6 6-6"/></svg>
            Înapoi la filme
          </a>

          <div class="detail-layout animate-in" style="animation-delay: 0.1s">
            <!-- Poster -->
            <div class="detail-poster">
              @if (movie.imagePath) {
                <img [src]="api.getMovieImageUrl(movie.imagePath)" [alt]="movie.title">
              } @else {
                <div class="poster-placeholder-lg">
                  <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><rect x="2" y="2" width="20" height="20" rx="2.18"/><line x1="7" y1="2" x2="7" y2="22"/><line x1="17" y1="2" x2="17" y2="22"/></svg>
                </div>
              }
            </div>

            <!-- Info -->
            <div class="detail-info">
              <div class="detail-badges">
                <span class="badge badge-accent">{{ formatLabels[movie.formatType] || movie.formatType }}</span>
                <span class="badge badge-info">{{ movie.soundFormat }}</span>
                @if (movie.ageRestriction) {
                  <span class="badge badge-info">{{ movie.ageRestriction }}+</span>
                }
              </div>

              <h1 class="detail-title">{{ movie.title }}</h1>

              <div class="detail-meta">
                <span class="meta-item">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  {{ movie.durationMinutes }} min
                </span>
                <span class="meta-item">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/></svg>
                  {{ movie.releaseDate }}
                </span>
                <span class="meta-item genre-tag">{{ genreLabels[movie.genre] || movie.genre }}</span>
              </div>

              <p class="detail-description">{{ movie.description }}</p>

              <div class="detail-section">
                <h4>Limbi audio</h4>
                <div class="tag-row">
                  @for (lang of movie.audioLanguages; track lang) {
                    <span class="lang-chip">{{ langLabels[lang] || lang }}</span>
                  }
                </div>
              </div>

              @if (actorNames.length > 0) {
                <div class="detail-section">
                  <h4>Actori</h4>
                  <p class="cast-names">{{ actorNames.join(', ') }}</p>
                </div>
              }

              @if (directorNames.length > 0) {
                <div class="detail-section">
                  <h4>Regizori</h4>
                  <p class="cast-names">{{ directorNames.join(', ') }}</p>
                </div>
              }
            </div>
          </div>

          <!-- Trailer -->
          @if (trailerEmbedUrl) {
            <div class="trailer-section animate-in" style="animation-delay: 0.25s">
              <h2 class="section-title">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                TRAILER
              </h2>
              <div class="trailer-wrapper">
                <iframe [src]="trailerEmbedUrl" frameborder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowfullscreen></iframe>
              </div>
            </div>
          }
        </div>
      }
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
      transition: color var(--transition);
    }
    .back-link:hover { color: var(--accent); }

    .detail-layout {
      display: grid;
      grid-template-columns: 340px 1fr;
      gap: 48px;
      margin-bottom: 48px;
    }

    .detail-poster {
      border-radius: var(--radius-xl);
      overflow: hidden;
      aspect-ratio: 2/3;
      background: var(--bg-card);
      border: 1px solid var(--border);
    }
    .detail-poster img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .poster-placeholder-lg {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--text-muted);
      background: linear-gradient(135deg, var(--bg-secondary), var(--bg-card));
    }

    .detail-badges {
      display: flex;
      gap: 8px;
      margin-bottom: 16px;
    }

    .detail-title {
      font-family: var(--font-display);
      font-size: 3.5rem;
      line-height: 1;
      letter-spacing: 2px;
      margin-bottom: 16px;
      background: linear-gradient(135deg, var(--text-primary), var(--accent));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .detail-meta {
      display: flex;
      align-items: center;
      gap: 20px;
      margin-bottom: 24px;
      flex-wrap: wrap;
    }
    .meta-item {
      display: flex;
      align-items: center;
      gap: 6px;
      color: var(--text-secondary);
      font-size: 0.9rem;
    }
    .genre-tag {
      padding: 4px 14px;
      background: var(--accent-dim);
      border-radius: 20px;
      color: var(--accent);
      font-weight: 500;
    }

    .detail-description {
      color: var(--text-secondary);
      font-size: 1rem;
      line-height: 1.7;
      margin-bottom: 32px;
    }

    .detail-section {
      margin-bottom: 24px;
    }
    .detail-section h4 {
      font-family: var(--font-display);
      font-size: 1rem;
      letter-spacing: 2px;
      color: var(--text-muted);
      margin-bottom: 10px;
    }
    .tag-row {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }
    .lang-chip {
      padding: 6px 16px;
      background: var(--bg-secondary);
      border: 1px solid var(--border);
      border-radius: 20px;
      font-size: 0.82rem;
      color: var(--text-primary);
    }
    .cast-names {
      color: var(--text-secondary);
      font-size: 0.95rem;
    }

    .trailer-section {
      margin-bottom: 48px;
    }
    .section-title {
      display: flex;
      align-items: center;
      gap: 12px;
      font-family: var(--font-display);
      font-size: 1.8rem;
      letter-spacing: 3px;
      margin-bottom: 20px;
    }
    .trailer-wrapper {
      position: relative;
      padding-bottom: 56.25%;
      border-radius: var(--radius-xl);
      overflow: hidden;
      background: var(--bg-secondary);
      border: 1px solid var(--border);
    }
    .trailer-wrapper iframe {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
    }

    @media (max-width: 768px) {
      .detail-layout {
        grid-template-columns: 1fr;
        gap: 24px;
      }
      .detail-poster { max-width: 280px; }
      .detail-title { font-size: 2.5rem; }
    }
  `]
})
export class MovieDetailComponent implements OnInit {
  movie: MovieDto | null = null;
  actorNames: string[] = [];
  directorNames: string[] = [];
  trailerEmbedUrl: SafeResourceUrl | null = null;
  loading = true;

  genreLabels = GenreLabels;
  langLabels = AudioLanguageLabels;
  formatLabels = FormatTypeLabels;

  constructor(
    private route: ActivatedRoute,
    public api: ApiService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.api.getMovie(id).subscribe({
      next: movie => {
        this.movie = movie;
        this.loading = false;
        this.loadCast(movie);
        this.buildTrailerUrl(movie.trailerUrl);
      },
      error: () => this.loading = false
    });
  }

  private loadCast(movie: MovieDto) {
    if (movie.actorIds?.length) {
      const actorObs = movie.actorIds.map(id => this.api.getActor(id));
      forkJoin(actorObs).subscribe(actors => this.actorNames = actors.map(a => a.name));
    }
    if (movie.directorIds?.length) {
      const dirObs = movie.directorIds.map(id => this.api.getDirector(id));
      forkJoin(dirObs).subscribe(dirs => this.directorNames = dirs.map(d => d.name));
    }
  }

  private buildTrailerUrl(url?: string) {
    if (!url) return;
    let videoId = '';
    if (url.includes('youtube.com/watch')) {
      videoId = new URL(url).searchParams.get('v') || '';
    } else if (url.includes('youtu.be/')) {
      videoId = url.split('youtu.be/')[1]?.split('?')[0] || '';
    } else if (url.includes('youtube.com/embed/')) {
      videoId = url.split('embed/')[1]?.split('?')[0] || '';
    }
    if (videoId) {
      this.trailerEmbedUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
        `https://www.youtube.com/embed/${videoId}`
      );
    }
  }
}
