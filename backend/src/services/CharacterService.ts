import { Op, WhereOptions } from 'sequelize';
import { Character, Comment, Favorite } from '../models';
import { CharacterAttributes } from '../models/Character';
import CacheService from './CacheService';
import { MeasureTime } from '../utils/timeDecorator';

export interface CharacterFilters {
  name?: string;
  status?: string;
  species?: string;
  gender?: string;
  origin?: string;
  page?: number;
  sort?: 'asc' | 'desc';
  includeDeleted?: boolean;
  /** When true: only characters the userId has starred. When false: only non-starred. */
  onlyFavorites?: boolean;
}

export interface PaginatedCharacters {
  results: Character[];
  total: number;
  page: number;
  pages: number;
}

class CharacterService {
  @MeasureTime
  async getCharacters(filters: CharacterFilters = {}, userId?: string): Promise<PaginatedCharacters> {
    const cacheKey = CacheService.buildKey(
      'characters',
      filters.name,
      filters.status,
      filters.species,
      filters.gender,
      filters.origin,
      filters.page,
      filters.sort,
      filters.includeDeleted ? '1' : '0',
      filters.onlyFavorites !== undefined ? String(filters.onlyFavorites) : 'all',
      userId || ''
    );

    const cached = await CacheService.get<PaginatedCharacters>(cacheKey);
    if (cached) {
      console.log(`🔴 Cache HIT for key: ${cacheKey}`);
      return cached;
    }
    console.log(`🟢 Cache MISS for key: ${cacheKey}`);

    const where: WhereOptions<CharacterAttributes> = {};

    if (!filters.includeDeleted) {
      where.isDeleted = false;
    }
    if (filters.name) {
      where.name = { [Op.iLike]: `%${filters.name}%` };
    }
    if (filters.status) {
      where.status = { [Op.iLike]: filters.status };
    }
    if (filters.species) {
      where.species = { [Op.iLike]: `%${filters.species}%` };
    }
    if (filters.gender) {
      where.gender = { [Op.iLike]: filters.gender };
    }
    if (filters.origin) {
      where.originName = { [Op.iLike]: `%${filters.origin}%` };
    }

    // Server-side starred/others filtering using a fast ID set lookup
    if (filters.onlyFavorites !== undefined && userId) {
      const favRows = await Favorite.findAll({
        where: { userId },
        attributes: ['characterId'],
      });
      const starredIds = favRows.map((f) => f.characterId);

      if (filters.onlyFavorites === true) {
        // Only starred: no results if user has no favorites
        if (starredIds.length === 0) {
          return { results: [], total: 0, page: 1, pages: 0 };
        }
        (where as Record<string, unknown>).id = { [Op.in]: starredIds };
      } else {
        // Only others: exclude starred IDs
        if (starredIds.length > 0) {
          (where as Record<string, unknown>).id = { [Op.notIn]: starredIds };
        }
      }
    }

    const page = filters.page || 1;
    const limit = 20;
    const offset = (page - 1) * limit;
    const order: [string, string][] = [['name', filters.sort === 'desc' ? 'DESC' : 'ASC']];

    const { count, rows } = await Character.findAndCountAll({
      where,
      order,
      limit,
      offset,
      distinct: true,
      col: 'Character.id',
      include: [
        { model: Comment, as: 'comments', separate: true },
        { model: Favorite, as: 'favorites', separate: true },
      ],
    });

    const result: PaginatedCharacters = {
      results: rows,
      total: count,
      page,
      pages: Math.ceil(count / limit),
    };

    await CacheService.set(cacheKey, result);
    return result;
  }

  @MeasureTime
  async getCharacterById(id: number, userId?: string): Promise<Character | null> {
    const cacheKey = CacheService.buildKey('character', id);
    const cached = await CacheService.get<Character>(cacheKey);
    if (cached) {
      console.log(`🔴 Cache HIT for key: ${cacheKey}`);
      return cached;
    }

    const character = await Character.findOne({
      where: { id, isDeleted: false },
      include: [
        { model: Comment, as: 'comments' },
        { model: Favorite, as: 'favorites' },
      ],
    });

    if (character) {
      await CacheService.set(cacheKey, character, 600);
    }

    return character;
  }

  async addComment(
    characterId: number,
    author: string,
    content: string
  ): Promise<Comment> {
    const character = await Character.findOne({ where: { id: characterId, isDeleted: false } });
    if (!character) throw new Error('Character not found');

    const comment = await Comment.create({ characterId, author, content });
    await CacheService.del(CacheService.buildKey('character', characterId));
    return comment;
  }

  async deleteComment(commentId: number): Promise<boolean> {
    const comment = await Comment.findByPk(commentId);
    if (!comment) throw new Error('Comment not found');

    const character = await Character.findOne({
      where: { id: comment.characterId, isDeleted: false },
    });
    if (!character) throw new Error('Character not found');

    const characterId = comment.characterId;
    await comment.destroy();
    await CacheService.del(CacheService.buildKey('character', characterId));
    return true;
  }

  async toggleFavorite(characterId: number, userId: string): Promise<boolean> {
    const character = await Character.findOne({ where: { id: characterId, isDeleted: false } });
    if (!character) throw new Error('Character not found');

    const existing = await Favorite.findOne({ where: { characterId, userId } });

    if (existing) {
      await existing.destroy();
    } else {
      await Favorite.create({ characterId, userId });
    }

    // Invalidate both single-character and full list caches
    await Promise.all([
      CacheService.del(CacheService.buildKey('character', characterId)),
      CacheService.invalidatePattern('characters:*'),
    ]);

    return !existing;
  }

  async softDelete(id: number): Promise<Character> {
    const character = await Character.findByPk(id);
    if (!character) throw new Error('Character not found');

    await character.update({ isDeleted: true });
    await CacheService.invalidatePattern('characters:*');
    await CacheService.del(CacheService.buildKey('character', id));
    return character;
  }

  async restoreCharacter(id: number): Promise<Character> {
    const character = await Character.findByPk(id);
    if (!character) throw new Error('Character not found');

    await character.update({ isDeleted: false });
    await CacheService.invalidatePattern('characters:*');
    return character;
  }

  async upsertCharacter(data: Omit<CharacterAttributes, 'id' | 'isDeleted'>): Promise<Character> {
    const [character] = await Character.upsert({ ...data, isDeleted: false });
    await CacheService.invalidatePattern('characters:*');
    return character;
  }
}

export default new CharacterService();
