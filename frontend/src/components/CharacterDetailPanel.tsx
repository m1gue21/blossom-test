import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApolloClient, useQuery, useMutation } from '@apollo/client';
import { GET_CHARACTER, TOGGLE_FAVORITE, SOFT_DELETE_CHARACTER } from '@/graphql/queries';
import { Character } from '@/types';
import { ConfirmDeleteModal } from '@/components/ConfirmDeleteModal';
import { CommentSection } from '@/components/CommentSection';
import { HeartFilledDetail, HeartOutline } from '@/components/HeartIcons';

/** ViewBox 128×128; main circle centered at (64,64) with radius 64. */
const VIEW_MAIN_CX = 64;
const VIEW_MAIN_R = 64;
/**
 * Center of the hole/badge on the bottom-right diagonal, on the avatar circumference
 * (design reference: the white circle center sits on the avatar edge).
 */
const AVATAR_HOLE = {
  cx: VIEW_MAIN_CX + VIEW_MAIN_R / Math.SQRT2,
  cy: VIEW_MAIN_CX + VIEW_MAIN_R / Math.SQRT2,
  r: 23,
} as const;

/** Badge diameter in px (matches the mask cutout). */
const BADGE_DIAMETER_PX = AVATAR_HOLE.r * 2;
/**
 * Heart SVG size relative to the white circle (reference: even minimal padding).
 * The icon path does not fill the 24×24 viewBox; a ratio of the badge diameter offsets that internal padding.
 */
const HEART_RELATIVE_TO_BADGE = 0.66;
const HEART_SIZE_PX = Math.round(BADGE_DIAMETER_PX * HEART_RELATIVE_TO_BADGE);

interface CharacterDetailPanelProps {
  characterId: number;
  userId: string;
  onBack?: () => void;
}

export function CharacterDetailPanel({ characterId, userId, onBack }: CharacterDetailPanelProps) {
  const navigate = useNavigate();
  const client = useApolloClient();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const { data, loading } = useQuery<{ character: Character }>(GET_CHARACTER, {
    variables: { id: characterId, userId },
  });

  const [toggleFavorite, { loading: toggling }] = useMutation(TOGGLE_FAVORITE, {
    refetchQueries: [{ query: GET_CHARACTER, variables: { id: characterId, userId } }],
  });

  const [softDelete, { loading: deleting }] = useMutation(SOFT_DELETE_CHARACTER);

  if (loading) {
    return (
      <div className="flex flex-1 flex-col items-stretch px-8 pt-6">
        <div className="mb-4 h-6 w-6 animate-pulse rounded bg-gray-100" />
        <div className="flex items-start justify-between gap-4">
          <div className="h-32 w-32 shrink-0 animate-pulse rounded-full bg-gray-100" />
          <div className="h-9 w-28 animate-pulse rounded-lg bg-gray-100" />
        </div>
        <div className="mt-6 mb-8 h-8 w-3/4 max-w-sm animate-pulse rounded bg-gray-100" />
        <div className="space-y-4">
          <div className="h-14 animate-pulse rounded-lg bg-gray-50" />
          <div className="h-14 animate-pulse rounded-lg bg-gray-50" />
        </div>
      </div>
    );
  }

  const character = data?.character;
  if (!character) return null;

  const rows = [
    { label: 'Species', value: character.species },
    { label: 'Status', value: character.status },
    { label: 'Occupation', value: character.type || character.originName },
  ];

  const runDelete = () => {
    softDelete({ variables: { id: character.id } }).then(async () => {
      setConfirmOpen(false);
      await client.refetchQueries({ include: 'active' });
      navigate('/');
      onBack?.();
    });
  };

  return (
    <div className="flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-y-auto bg-white">
      <div className="flex w-full flex-col pb-10">
        <div className="px-8 pt-6">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="mb-4 flex items-center text-primary-600 transition-colors hover:text-primary-700"
              aria-label="Back"
            >
              <svg viewBox="0 0 24 24" className="h-6 w-6 fill-current" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
              </svg>
            </button>
          )}

          {/* Same row: circular avatar + favorite; delete on the right (design reference) */}
          <div className="flex items-start justify-between gap-4">
            <div className="relative inline-block h-32 w-32 shrink-0 bg-white">
              {/*
                SVG mask: photo in a circle with a real corner cutout; the panel white background
                fills the gap — same as the reference, no shadows or rings on the photo.
              */}
              <svg
                width={128}
                height={128}
                viewBox="0 0 128 128"
                className="block h-32 w-32"
                aria-hidden
              >
                <defs>
                  <mask id={`character-avatar-mask-${character.id}`}>
                    <circle cx={64} cy={64} r={64} fill="white" />
                    <circle cx={AVATAR_HOLE.cx} cy={AVATAR_HOLE.cy} r={AVATAR_HOLE.r} fill="black" />
                  </mask>
                </defs>
                <image
                  href={character.image}
                  x={0}
                  y={0}
                  width={128}
                  height={128}
                  preserveAspectRatio="xMidYMid slice"
                  mask={`url(#character-avatar-mask-${character.id})`}
                />
              </svg>
              <button
                type="button"
                onClick={() => toggleFavorite({ variables: { characterId: character.id, userId } })}
                disabled={toggling}
                className={[
                  'absolute z-10 flex items-center justify-center rounded-full bg-white',
                  'shadow-none ring-0 outline-none',
                  'focus-visible:ring-2 focus-visible:ring-primary-500/40 focus-visible:ring-offset-2',
                  'transition-transform hover:scale-105 active:scale-95 disabled:opacity-50',
                ].join(' ')}
                style={{
                  left: `${((AVATAR_HOLE.cx - AVATAR_HOLE.r) / 128) * 100}%`,
                  top: `${((AVATAR_HOLE.cy - AVATAR_HOLE.r) / 128) * 100}%`,
                  width: BADGE_DIAMETER_PX,
                  height: BADGE_DIAMETER_PX,
                }}
                aria-label={character.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
              >
                {character.isFavorite ? (
                  <HeartFilledDetail
                    className="shrink-0"
                    style={{ width: HEART_SIZE_PX, height: HEART_SIZE_PX }}
                  />
                ) : (
                  <HeartOutline
                    className="shrink-0"
                    style={{ width: HEART_SIZE_PX, height: HEART_SIZE_PX }}
                  />
                )}
              </button>
            </div>
            <button
              type="button"
              onClick={() => setConfirmOpen(true)}
              disabled={deleting}
              className="shrink-0 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700 transition-colors hover:bg-red-100 disabled:opacity-50"
              data-testid="soft-delete-character"
            >
              Delete character
            </button>
          </div>

          <h2 className="mb-8 mt-6 text-2xl font-bold leading-snug tracking-tight text-[#1a1a1a]">
            {character.name}
          </h2>
        </div>

        {rows.map(({ label, value }, index) => (
          <section key={label} className="w-full">
            {index > 0 && (
              <div className="mx-8 h-px shrink-0 bg-gray-200" aria-hidden />
            )}
            <div className="px-8 py-5">
              <p className="mb-1 text-[15px] font-bold leading-tight text-text-primary">{label}</p>
              <p className="text-[15px] font-normal leading-snug text-text-secondary">{value}</p>
            </div>
          </section>
        ))}

        <div className="mx-8 border-t border-gray-200" />

        <div className="px-8 pt-6">
          <CommentSection
            characterId={character.id}
            userId={userId}
            comments={character.comments ?? []}
            className="mt-0"
          />
        </div>
      </div>

      <ConfirmDeleteModal
        open={confirmOpen}
        title="Delete character?"
        message={`${character.name} will be removed from your list (soft delete). Comments are not deleted automatically—you can remove them separately.`}
        confirmLabel="Delete character"
        cancelLabel="Cancel"
        loading={deleting}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={runDelete}
      />
    </div>
  );
}
