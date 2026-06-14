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
  templateUrl: './movie-detail.component.html',
  styleUrl: './movie-detail.component.scss'
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
  ) { }

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
