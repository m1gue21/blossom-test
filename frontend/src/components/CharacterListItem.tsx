import { useMutation } from '@apollo/client';
import { Character } from '@/types';
import { TOGGLE_FAVORITE, GET_CHARACTERS } from '@/graphql/queries';
import { HeartFilled, HeartOutline } from '@/components/HeartIcons';

interface CharacterListItemProps {
  character: Character;
  isSelected: boolean;
  userId: string;
  onSelect: (character: Character) => void;
  /**
   * 'card' → starred items: rounded card with horizontal margin (default)
   * 'list' → flat rows; optional divider between items (e.g. list layout with lines)
   */
  variant?: 'card' | 'list';
  divider?: boolean;
}

export function CharacterListItem({
  character,
  isSelected,
  userId,
  onSelect,
  variant = 'card',
  divider = false,
}: CharacterListItemProps) {
  const [toggleFavorite, { loading }] = useMutation(TOGGLE_FAVORITE, {
    // Optimistically flip isFavorite in the normalized Apollo cache so the
    // character moves between sections immediately, without waiting for the
    // server round-trip.
    optimisticResponse: { toggleFavorite: !character.isFavorite },
    update(cache) {
      const cacheId = cache.identify({ __typename: 'Character', id: character.id });
      if (cacheId) {
        cache.modify({
          id: cacheId,
          fields: { isFavorite: () => !character.isFavorite },
        });
      }
    },
    // Refetch in background so server state confirms the change
    refetchQueries: [GET_CHARACTERS],
    awaitRefetchQueries: false,
  });

  const handleHeartClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (loading) return;
    toggleFavorite({ variables: { characterId: character.id, userId } });
  };

  const isCard = variant === 'card';

  return (
    <div>
      <div
        onClick={() => onSelect(character)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && onSelect(character)}
        data-testid="character-list-item"
        className={[
          'flex items-center gap-3 px-4 py-5 cursor-pointer transition-colors',
          isSelected
            ? 'bg-primary-100 rounded-lg mx-5'
            : 'hover:bg-gray-100/60 mx-5 rounded-lg',
        ].join(' ')}
      >
        {/* Avatar */}
        <img
          src={character.image}
          alt={character.name}
          className="w-10 h-10 rounded-full object-cover flex-shrink-0"
          loading="lazy"
        />

        {/* Text */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-text-primary leading-tight truncate">
            {character.name}
          </p>
          <p className="text-xs text-text-secondary leading-tight mt-0.5 truncate">
            {character.species}
          </p>
        </div>

        {/* Heart:
              - Selected + favorited → white circle badge + shadow + green filled heart
              - Not selected + favorited → plain green filled heart, no badge
              - Not favorited → plain outlined heart, no badge */}
        <button
          onClick={handleHeartClick}
          disabled={loading}
          className={[
            'flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full',
            'transition-all disabled:opacity-40',
            isSelected && character.isFavorite
              ? 'bg-white hover:scale-110 active:scale-95'
              : 'hover:opacity-70',
          ].join(' ')}
          aria-label={character.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          {character.isFavorite ? <HeartFilled /> : <HeartOutline />}
        </button>
      </div>

      {/* Divider — same horizontal width as the row (mx-5), like the selected background */}
      {divider && !isSelected && (
        <div className="mx-5 border-b border-gray-200" aria-hidden />
      )}
    </div>
  );
}
