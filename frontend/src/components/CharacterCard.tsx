import { Link } from 'react-router-dom';
import { useMutation } from '@apollo/client';
import { Character } from '@/types';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { SOFT_DELETE_CHARACTER, RESTORE_CHARACTER, GET_CHARACTERS } from '@/graphql/queries';

interface CharacterCardProps {
  character: Character;
  userId: string;
}

export function CharacterCard({ character, userId }: CharacterCardProps) {
  const [softDelete, { loading: deleting }] = useMutation(SOFT_DELETE_CHARACTER, {
    refetchQueries: [GET_CHARACTERS],
  });
  const [restore, { loading: restoring }] = useMutation(RESTORE_CHARACTER, {
    refetchQueries: [GET_CHARACTERS],
  });

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    softDelete({ variables: { id: character.id } });
  };

  const handleRestore = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    restore({ variables: { id: character.id } });
  };

  return (
    <Link
      to={`/character/${character.id}?userId=${userId}`}
      className={`group block rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-rm-green/20 animate-fade-in ${
        character.isDeleted
          ? 'opacity-50 border border-red-500/30 bg-red-950/20'
          : 'bg-rm-card border border-white/5 hover:border-rm-green/30'
      }`}
      data-testid="character-card"
    >
      <div className="relative aspect-square overflow-hidden">
        <img
          src={character.image}
          alt={character.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
        />
        {character.isFavorite && (
          <div className="absolute top-2 right-2 text-xl drop-shadow-lg">⭐</div>
        )}
        {character.isDeleted && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60">
            <span className="text-red-400 font-bold text-sm tracking-widest uppercase">Deleted</span>
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="font-bold text-white text-base truncate group-hover:text-rm-green transition-colors mb-1">
          {character.name}
        </h3>

        <div className="flex items-center justify-between mb-2">
          <StatusBadge status={character.status} />
          <span className="text-gray-400 text-xs">{character.species}</span>
        </div>

        <p className="text-gray-500 text-xs truncate">📍 {character.locationName}</p>

        <div className="mt-3 flex gap-2">
          {!character.isDeleted ? (
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="flex-1 text-xs py-1.5 px-3 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 transition-colors disabled:opacity-50"
            >
              {deleting ? '...' : 'Delete'}
            </button>
          ) : (
            <button
              onClick={handleRestore}
              disabled={restoring}
              className="flex-1 text-xs py-1.5 px-3 rounded-lg bg-green-500/10 text-green-400 hover:bg-green-500/20 border border-green-500/20 transition-colors disabled:opacity-50"
            >
              {restoring ? '...' : 'Restore'}
            </button>
          )}
          <span className="flex-1 text-center text-xs py-1.5 px-3 rounded-lg bg-white/5 text-gray-400">
            View →
          </span>
        </div>
      </div>
    </Link>
  );
}
