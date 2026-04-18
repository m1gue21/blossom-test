import CharacterService from '../../services/CharacterService';
import { Character } from '../../models';
import Favorite from '../../models/Favorite';

export interface CharactersArgs {
  name?: string;
  status?: string;
  species?: string;
  gender?: string;
  origin?: string;
  page?: number;
  sort?: 'asc' | 'desc';
  userId?: string;
  onlyFavorites?: boolean;
}

export interface CharacterArgs {
  id: number;
  userId?: string;
}

export interface AddCommentArgs {
  characterId: number;
  author: string;
  content: string;
}

export interface ToggleFavoriteArgs {
  characterId: number;
  userId: string;
}

export interface IdArgs {
  id: number;
}

function withFavoriteFlag(character: Character | Record<string, unknown>, userId?: string): object {
  const plain: Record<string, unknown> =
    typeof (character as Character).toJSON === 'function'
      ? ((character as Character).toJSON() as unknown as Record<string, unknown>)
      : { ...(character as Record<string, unknown>) };

  if (userId && Array.isArray(plain.favorites)) {
    plain.isFavorite = (plain.favorites as Favorite[]).some(
      (f) => f.userId === userId
    );
  } else {
    plain.isFavorite = false;
  }
  return plain;
}

export const characterResolvers = {
  Query: {
    characters: async (_: unknown, args: CharactersArgs) => {
      const { userId, onlyFavorites, ...filters } = args;
      const paginated = await CharacterService.getCharacters(
        { ...filters, onlyFavorites },
        userId
      );
      return {
        ...paginated,
        results: paginated.results.map((c) => withFavoriteFlag(c, userId)),
      };
    },

    character: async (_: unknown, { id, userId }: CharacterArgs) => {
      const character = await CharacterService.getCharacterById(id, userId);
      if (!character) return null;
      return withFavoriteFlag(character, userId);
    },
  },

  Mutation: {
    addComment: async (_: unknown, { characterId, author, content }: AddCommentArgs) => {
      return CharacterService.addComment(characterId, author, content);
    },

    deleteComment: async (_: unknown, { id }: IdArgs) => {
      return CharacterService.deleteComment(id);
    },

    toggleFavorite: async (_: unknown, { characterId, userId }: ToggleFavoriteArgs) => {
      return CharacterService.toggleFavorite(characterId, userId);
    },

    softDeleteCharacter: async (_: unknown, { id }: IdArgs) => {
      return CharacterService.softDelete(id);
    },

    restoreCharacter: async (_: unknown, { id }: IdArgs) => {
      return CharacterService.restoreCharacter(id);
    },
  },
};
