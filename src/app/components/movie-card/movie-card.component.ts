import { Component, input, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AudioLanguageLabels, FormatTypeLabels, GenreLabels, MovieDto } from '@app/models/models';
import { ApiService } from '@app/services/api.service';

@Component({
  selector: 'app-movie-card',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './movie-card.component.html',
  styleUrl: './movie-card.component.scss'
})
export class MovieCardComponent implements OnInit{
  formatLabels = FormatTypeLabels;
  genreLabels = GenreLabels;
  langLabels = AudioLanguageLabels;
  
  index = input.required<number>();
  movie = input.required<MovieDto>();
  movieImagePath = signal<string>('');

  constructor(public api: ApiService) {}

  ngOnInit(): void {
    this.movieImagePath.set(this.api.getMovieImageUrl(this.movie().imagePath))
  }

}
