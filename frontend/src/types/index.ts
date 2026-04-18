export interface Comment {
  id: number;
  characterId: number;
  author: string;
  content: string;
  createdAt?: string;
}

export interface Favorite {
  id: number;
  characterId: number;
  userId: string;
  createdAt?: string;
}

export interface Character {
  id: number;
  externalId: number;
  name: string;
  status: 'Alive' | 'Dead' | 'unknown';
  species: string;
  type?: string;
  gender: 'Female' | 'Male' | 'Genderless' | 'unknown';
  originName: string;
  locationName: string;
  image: string;
  episode?: string[];
  url: string;
  isDeleted: boolean;
  isFavorite?: boolean;
  comments?: Comment[];
  favorites?: Favorite[];
  createdAt?: string;
  updatedAt?: string;
}

export interface PaginatedCharacters {
  results: Character[];
  total: number;
  page: number;
  pages: number;
}

export type SortOrder = 'asc' | 'desc';

export interface CharacterFilters {
  name?: string;
  status?: string;
  species?: string;
  gender?: string;
  origin?: string;
  page?: number;
  sort?: SortOrder;
  userId?: string;
  _starred?: boolean;
}
