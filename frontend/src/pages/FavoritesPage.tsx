import { useNavigate } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import { GET_CHARACTERS } from '@/graphql/queries';
import { PaginatedCharacters } from '@/types';
import { CharacterListItem } from '@/components/CharacterListItem';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useUser } from '@/hooks/useUser';

export function FavoritesPage() {
  const userId = useUser();
  const navigate = useNavigate();

  const { data, loading } = useQuery<{ characters: PaginatedCharacters }>(GET_CHARACTERS, {
    variables: { userId, sort: 'asc' },
  });

  const favorites = (data?.characters.results ?? []).filter((c) => c.isFavorite && !c.isDeleted);

  return (
    <div className="flex h-full overflow-hidden">
      <aside className="w-full lg:w-72 xl:w-80 flex-shrink-0 border-r border-border flex flex-col h-full overflow-hidden">
        <div className="px-5 pt-6 pb-4">
          <h1 className="text-xl font-bold text-text-primary">Starred Characters</h1>
          {!loading && (
            <p className="text-sm text-text-secondary mt-1">{favorites.length} characters</p>
          )}
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <LoadingSpinner text="Loading..." />
          ) : favorites.length === 0 ? (
            <div className="text-center py-16 px-6">
              <p className="text-4xl mb-3">💚</p>
              <p className="text-sm font-medium text-text-primary mb-1">No favorites yet</p>
              <p className="text-xs text-text-secondary mb-4">
                Tap the heart icon on any character to add them here
              </p>
              <button
                onClick={() => navigate('/')}
                className="text-xs text-primary-600 font-medium hover:underline"
              >
                Browse characters →
              </button>
            </div>
          ) : (
            <section>
              <p className="px-4 pt-2 pb-1 text-xs font-semibold uppercase tracking-wider text-text-label">
                Starred Characters ({favorites.length})
              </p>
              {favorites.map((char) => (
                <CharacterListItem
                  key={char.id}
                  character={char}
                  isSelected={false}
                  userId={userId}
                  onSelect={(c) => navigate(`/character/${c.id}`)}
                />
              ))}
            </section>
          )}
        </div>
      </aside>

      <main className="flex-1 hidden lg:flex items-center justify-center">
        <div className="bg-surface rounded-2xl px-8 py-4 text-text-secondary text-sm font-medium">
          Select character
        </div>
      </main>
    </div>
  );
}
