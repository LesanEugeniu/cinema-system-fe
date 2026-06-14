import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import {
  MovieDto, MovieSearchDto, ActorDto, DirectorDto,
  Genre, GenreLabels, AudioLanguage, AudioLanguageLabels,
  FormatType, FormatTypeLabels, SoundFormat
} from '../../models/models';
import { MovieCardComponent } from '../movie-card/movie-card.component';

@Component({
  selector: 'app-movies',
  standalone: true,
  imports: [CommonModule, FormsModule, MovieCardComponent],
  templateUrl: './movies.component.html',
  styleUrl: './movies.component.scss'
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
  page: number = 0;
  lastPage: number = Number.MAX_VALUE;
  isFetchingMovies: boolean = false;

  constructor(public api: ApiService) { }

  ngOnInit() {
    this.api.getActors().subscribe(a => this.actors = a);
    this.api.getDirectors().subscribe(d => this.directors = d);
    this.loadMovies();
  }

  loadMovies() {
    this.loading = true;
    this.api.getMovies(this.page).subscribe({
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

  @HostListener('window:scroll')
  onWindowScroll() {
    if ((window.innerHeight + window.scrollY + 150) >= document.body.offsetHeight
      && this.page < this.lastPage && !this.isFetchingMovies) {
      console.log(">>>getMovies")
      this.isFetchingMovies = true;
      this.page++;

      this.api.getMovies(this.page).subscribe({
        next: movies => {
          this.movies.push(...movies);
          if (movies.length === 0) this.lastPage = this.page;
          this.isFetchingMovies = false;
        },
        error: () => this.isFetchingMovies = false
      });
    }
  }

}
