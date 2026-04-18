import CharacterService from '../services/CharacterService';
import { Character, Comment, Favorite } from '../models';
import CacheService from '../services/CacheService';

jest.mock('../models', () => ({
  Character: {
    findAndCountAll: jest.fn(),
    findOne: jest.fn(),
    findByPk: jest.fn(),
  },
  Comment: {
    create: jest.fn(),
  },
  Favorite: {
    findOne: jest.fn(),
    create: jest.fn(),
  },
}));

jest.mock('../services/CacheService', () => ({
  get: jest.fn().mockResolvedValue(null),
  set: jest.fn().mockResolvedValue(undefined),
  del: jest.fn().mockResolvedValue(undefined),
  invalidatePattern: jest.fn().mockResolvedValue(undefined),
  buildKey: jest.fn((...parts: string[]) => parts.join(':')),
}));

describe('CharacterService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getCharacters', () => {
    it('should return paginated characters', async () => {
      const mockCharacters = [
        { id: 1, name: 'Rick Sanchez', toJSON: () => ({ id: 1, name: 'Rick Sanchez' }) },
      ];
      (Character.findAndCountAll as jest.Mock).mockResolvedValue({
        count: 1,
        rows: mockCharacters,
      });

      const result = await CharacterService.getCharacters({ page: 1 });

      expect(result.total).toBe(1);
      expect(result.results).toHaveLength(1);
      expect(result.page).toBe(1);
      expect(result.pages).toBe(1);
    });

    it('should apply name filter with iLike', async () => {
      (Character.findAndCountAll as jest.Mock).mockResolvedValue({ count: 0, rows: [] });

      await CharacterService.getCharacters({ name: 'rick' });

      expect(Character.findAndCountAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            name: expect.objectContaining({}),
          }),
        })
      );
    });

    it('should return cached result if available', async () => {
      const cachedData = { results: [], total: 0, page: 1, pages: 0 };
      (CacheService.get as jest.Mock).mockResolvedValueOnce(cachedData);

      const result = await CharacterService.getCharacters({});

      expect(result).toEqual(cachedData);
      expect(Character.findAndCountAll).not.toHaveBeenCalled();
    });
  });

  describe('addComment', () => {
    it('should throw error if character not found', async () => {
      (Character.findOne as jest.Mock).mockResolvedValue(null);

      await expect(
        CharacterService.addComment(999, 'Author', 'Content')
      ).rejects.toThrow('Character not found');
    });

    it('should create a comment successfully', async () => {
      const mockChar = { id: 1, isDeleted: false };
      const mockComment = { id: 1, characterId: 1, author: 'Author', content: 'Content' };
      (Character.findOne as jest.Mock).mockResolvedValue(mockChar);
      (Comment.create as jest.Mock).mockResolvedValue(mockComment);

      const result = await CharacterService.addComment(1, 'Author', 'Content');

      expect(result).toEqual(mockComment);
      expect(Comment.create).toHaveBeenCalledWith({
        characterId: 1,
        author: 'Author',
        content: 'Content',
      });
    });
  });

  describe('toggleFavorite', () => {
    it('should add a favorite when it does not exist', async () => {
      (Character.findOne as jest.Mock).mockResolvedValue({ id: 1 });
      (Favorite.findOne as jest.Mock).mockResolvedValue(null);
      (Favorite.create as jest.Mock).mockResolvedValue({ id: 1 });

      const result = await CharacterService.toggleFavorite(1, 'user-123');

      expect(result).toBe(true);
      expect(Favorite.create).toHaveBeenCalledWith({ characterId: 1, userId: 'user-123' });
    });

    it('should remove a favorite when it already exists', async () => {
      const mockFavorite = { destroy: jest.fn().mockResolvedValue(undefined) };
      (Character.findOne as jest.Mock).mockResolvedValue({ id: 1 });
      (Favorite.findOne as jest.Mock).mockResolvedValue(mockFavorite);

      const result = await CharacterService.toggleFavorite(1, 'user-123');

      expect(result).toBe(false);
      expect(mockFavorite.destroy).toHaveBeenCalled();
    });
  });
});
