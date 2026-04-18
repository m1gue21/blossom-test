import { useParams, useSearchParams, Link } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client';
import { GET_CHARACTER, TOGGLE_FAVORITE } from '@/graphql/queries';
import { Character } from '@/types';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { CommentSection } from '@/components/CommentSection';
import { useUser } from '@/hooks/useUser';

export function CharacterDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const userId = useUser();
  const paramUserId = searchParams.get('userId') || userId;

  const { data, loading, error, refetch } = useQuery<{ character: Character }>(
    GET_CHARACTER,
    {
      variables: { id: parseInt(id!), userId: paramUserId },
      skip: !id,
    }
  );

  const [toggleFavorite, { loading: toggling }] = useMutation(TOGGLE_FAVORITE, {
    refetchQueries: [{ query: GET_CHARACTER, variables: { id: parseInt(id!), userId: paramUserId } }],
  });

  const character = data?.character;

  const handleToggleFavorite = () => {
    if (!character) return;
    toggleFavorite({ variables: { characterId: character.id, userId: paramUserId } });
  };

  if (loading) return <LoadingSpinner size="lg" text="Loading character details..." />;
  if (error) return <ErrorMessage message={error.message} onRetry={() => refetch()} />;
  if (!character) return <ErrorMessage message="Character not found" />;

  return (
    <div className="animate-fade-in">
      <Link
        to="/"
        className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors group"
      >
        <span className="group-hover:-translate-x-1 transition-transform">←</span>
        Back to Characters
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <div className="sticky top-24">
            <div className="rounded-2xl overflow-hidden border border-white/10 bg-rm-card shadow-2xl">
              <div className="relative aspect-square">
                <img
                  src={character.image}
                  alt={character.name}
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={handleToggleFavorite}
                  disabled={toggling}
                  className={`absolute top-3 right-3 w-10 h-10 rounded-full flex items-center justify-center text-xl shadow-lg transition-all hover:scale-110 active:scale-95 ${
                    character.isFavorite
                      ? 'bg-yellow-400/20 border border-yellow-400/50'
                      : 'bg-black/40 border border-white/20 hover:bg-yellow-400/10 hover:border-yellow-400/30'
                  } disabled:opacity-50`}
                  title={character.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                >
                  {character.isFavorite ? '⭐' : '☆'}
                </button>
              </div>

              <div className="p-5">
                <h1 className="text-2xl font-bold text-white mb-3">{character.name}</h1>
                <StatusBadge status={character.status} />

                <div className="mt-4 space-y-2.5">
                  <InfoRow label="Species" value={character.species} />
                  {character.type && <InfoRow label="Type" value={character.type} />}
                  <InfoRow label="Gender" value={character.gender} />
                  <InfoRow label="Origin" value={character.originName} />
                  <InfoRow label="Location" value={character.locationName} />
                  {character.episode && (
                    <InfoRow label="Episodes" value={`${character.episode.length} episodes`} />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-rm-card rounded-2xl border border-white/10 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">About {character.name}</h2>
              <button
                onClick={handleToggleFavorite}
                disabled={toggling}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  character.isFavorite
                    ? 'bg-yellow-400/20 text-yellow-400 border border-yellow-400/30 hover:bg-yellow-400/30'
                    : 'bg-white/5 text-gray-400 border border-white/10 hover:border-yellow-400/30 hover:text-yellow-400'
                } disabled:opacity-50`}
              >
                {character.isFavorite ? '⭐ Favorited' : '☆ Add to Favorites'}
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <StatCard icon="🧬" label="Species" value={character.species} />
              <StatCard icon="⚡" label="Status" value={character.status} />
              <StatCard icon="🌍" label="Origin" value={character.originName} />
              <StatCard icon="📍" label="Last Location" value={character.locationName} />
            </div>

            {character.episode && character.episode.length > 0 && (
              <div className="bg-white/5 rounded-xl p-4 border border-white/10 mb-6">
                <h3 className="text-sm font-semibold text-gray-300 mb-3">
                  🎬 Episode Appearances ({character.episode.length})
                </h3>
                <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                  {character.episode.map((ep, i) => {
                    const num = ep.split('/').pop();
                    return (
                      <span
                        key={i}
                        className="text-xs bg-rm-green/10 text-rm-green border border-rm-green/20 px-2 py-1 rounded-lg"
                      >
                        EP {num}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}

            <CommentSection
              characterId={character.id}
              userId={paramUserId}
              comments={character.comments || []}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <span className="text-gray-500 text-sm shrink-0">{label}</span>
      <span className="text-gray-200 text-sm text-right">{value}</span>
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="bg-white/5 rounded-xl p-3 border border-white/10">
      <div className="text-xl mb-1">{icon}</div>
      <p className="text-gray-500 text-xs">{label}</p>
      <p className="text-white text-sm font-medium truncate">{value}</p>
    </div>
  );
}
