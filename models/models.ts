// ============ ENUMS ============

export enum Genre {
  ACTION = 'ACTION',
  ADVENTURE = 'ADVENTURE',
  COMEDY = 'COMEDY',
  DRAMA = 'DRAMA',
  HORROR = 'HORROR',
  THRILLER = 'THRILLER',
  ROMANCE = 'ROMANCE',
  SCI_FI = 'SCI_FI',
  FANTASY = 'FANTASY',
  ANIMATION = 'ANIMATION',
  DOCUMENTARY = 'DOCUMENTARY',
  CRIME = 'CRIME',
  MYSTERY = 'MYSTERY',
  FAMILY = 'FAMILY'
}

export const GenreLabels: Record<string, string> = {
  ACTION: 'Action',
  ADVENTURE: 'Adventure',
  COMEDY: 'Comedy',
  DRAMA: 'Drama',
  HORROR: 'Horror',
  THRILLER: 'Thriller',
  ROMANCE: 'Romance',
  SCI_FI: 'Sci-Fi',
  FANTASY: 'Fantasy',
  ANIMATION: 'Animation',
  DOCUMENTARY: 'Documentary',
  CRIME: 'Crime',
  MYSTERY: 'Mystery',
  FAMILY: 'Family'
};

export enum AudioLanguage {
  RU = 'RU',
  EN = 'EN',
  RO = 'RO'
}

export const AudioLanguageLabels: Record<string, string> = {
  RU: 'Русский',
  EN: 'English',
  RO: 'Română'
};

export enum FormatType {
  TWO_D = 'TWO_D',
  THREE_D = 'THREE_D'
}

export const FormatTypeLabels: Record<string, string> = {
  TWO_D: '2D',
  THREE_D: '3D'
};

export enum SoundFormat {
  MONO = 'MONO',
  STEREO = 'STEREO',
  SURROUND = 'SURROUND'
}

export enum Role {
  USER = 'USER',
  ADMIN = 'ADMIN'
}

// ============ DTOs ============

export interface MovieDto {
  id?: number;
  title: string;
  imagePath?: string;
  description: string;
  durationMinutes: number;
  ageRestriction: number;
  genre: Genre;
  audioLanguages: AudioLanguage[];
  formatType: FormatType;
  soundFormat: SoundFormat;
  trailerUrl?: string;
  releaseDate: string;
  directorIds: number[];
  actorIds: number[];
}

export interface MovieSearchDto {
  actorIds?: number[];
  directorIds?: number[];
  soundFormat?: SoundFormat;
  formatType?: FormatType;
  audioLanguage?: AudioLanguage;
  genre?: Genre;
}

export interface MovieByScreeningDto {
  startDate: string;
  endDate: string;
}

export interface ActorDto {
  id?: number;
  name: string;
  movieIds?: number[];
}

export interface DirectorDto {
  id?: number;
  name: string;
  movieIds?: number[];
}

export interface HallDto {
  id?: number;
  name: string;
  totalRows: number;
  seatsPerRow: number;
  seatIds?: number[];
  screeningIds?: number[];
}

export interface SeatDto {
  id?: number;
  rowNumber: number;
  seatNumber: number;
  hallId: number;
}

export interface ScreeningDto {
  id?: number;
  startTime: string;
  endTime: string;
  hallId: number;
  movieId: number;
  bookingIds?: number[];
}

export interface BookingDto {
  id?: number;
  bookingDate: string;
  totalPrice: number;
  userId: number;
  screeningId: number;
  seatIds: number[];
}

export interface UserDto {
  id?: number;
  username: string;
  email: string;
  role: Role;
  bookingIds?: number[];
}

export interface AuthenticationRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  username: string;
  password: string;
}

export interface AuthenticationResponse {
  access_token: string;
  refresh_token: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmationPassword: string;
}
