import { useState } from 'react';
import { useMutation } from '@apollo/client';
import { Comment } from '@/types';
import { ADD_COMMENT, DELETE_COMMENT, GET_CHARACTER } from '@/graphql/queries';
import { ConfirmDeleteModal } from '@/components/ConfirmDeleteModal';
import { AddCommentModal } from '@/components/AddCommentModal';

interface CommentSectionProps {
  characterId: number;
  comments: Comment[];
  /** Must match `GetCharacter` so refetch updates the detail view. */
  userId?: string;
  className?: string;
}

export function CommentSection({ characterId, comments, userId, className = '' }: CommentSectionProps) {
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [addSubmitError, setAddSubmitError] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<Comment | null>(null);

  const [addComment, { loading }] = useMutation(ADD_COMMENT, {
    refetchQueries: [{ query: GET_CHARACTER, variables: { id: characterId, userId } }],
  });

  const [removeComment, { loading: deleting }] = useMutation(DELETE_COMMENT, {
    refetchQueries: [{ query: GET_CHARACTER, variables: { id: characterId, userId } }],
  });

  const handleAddSubmit = async (author: string, content: string) => {
    setAddSubmitError('');
    try {
      await addComment({ variables: { characterId, author, content } });
      setAddModalOpen(false);
    } catch {
      setAddSubmitError('Failed to add comment. Please try again.');
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleteError('');
    try {
      await removeComment({ variables: { id: deleteTarget.id } });
      setDeleteTarget(null);
    } catch {
      setDeleteError('Failed to delete comment. Please try again.');
    }
  };

  /** Human-readable date; if parsing fails or the comment is brand new, "Just now" (never "Invalid Date"). */
  const formatCommentTime = (raw?: string | null) => {
    if (raw == null || raw === '') return 'Just now';

    const trimmed = String(raw).trim();
    if (/^invalid date$/i.test(trimmed)) return 'Just now';

    const asNum = Number(trimmed);
    const d =
      /^\d+$/.test(trimmed) && !Number.isNaN(asNum)
        ? new Date(asNum)
        : new Date(trimmed);

    if (Number.isNaN(d.getTime())) return 'Just now';

    const ageMs = Date.now() - d.getTime();
    if (ageMs >= 0 && ageMs < 2 * 60 * 1000) return 'Just now';

    const formatted = d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
    if (!formatted || /^invalid/i.test(formatted)) return 'Just now';
    return formatted;
  };

  const sorted = [...comments].reverse();

  return (
    <div className={['mt-8', className].filter(Boolean).join(' ')} data-testid="comment-section">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h3 className="text-base font-semibold tracking-tight text-text-primary">Comments</h3>
          <span
            className="inline-flex min-w-[1.75rem] items-center justify-center rounded-full border border-border bg-surface px-2.5 py-0.5 text-xs font-medium text-text-secondary"
            aria-live="polite"
          >
            {comments.length}
          </span>
        </div>
        <button
          type="button"
          onClick={() => {
            setAddSubmitError('');
            setAddModalOpen(true);
          }}
          className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-100 focus:ring-offset-2"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden>
            <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
          </svg>
          Add comment
        </button>
      </div>

      {deleteError ? (
        <p className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          {deleteError}
        </p>
      ) : null}

      {comments.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-gradient-to-b from-surface to-white px-6 py-12 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-100 text-primary-600">
            <svg viewBox="0 0 24 24" className="h-7 w-7" fill="currentColor" aria-hidden>
              <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z" />
            </svg>
          </div>
          <p className="text-base font-semibold text-text-primary">No comments yet</p>
          <p className="mt-1 text-sm text-text-secondary">Be the first to leave a note about this character.</p>
          <button
            type="button"
            onClick={() => {
              setAddSubmitError('');
              setAddModalOpen(true);
            }}
            className="mt-6 inline-flex items-center gap-2 rounded-xl border border-primary-600/30 bg-white px-5 py-2.5 text-sm font-semibold text-primary-600 transition-colors hover:bg-primary-100/50"
          >
            Write the first comment
          </button>
        </div>
      ) : (
        <ul className="space-y-0 rounded-2xl border border-border bg-white shadow-sm ring-1 ring-black/[0.03]">
          {sorted.map((comment, index) => {
            const dateLabel = formatCommentTime(comment.createdAt);
            const initial = comment.author.charAt(0).toUpperCase();
            return (
              <li
                key={comment.id}
                className={[
                  'animate-fade-in',
                  index > 0 ? 'border-t border-border' : '',
                ].join(' ')}
              >
                <article className="flex gap-4 px-5 py-5 sm:px-6">
                  <div className="flex shrink-0 flex-col items-center">
                    <div
                      className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-100 to-primary-100/50 text-sm font-bold text-primary-700 shadow-sm ring-2 ring-white"
                      aria-hidden
                    >
                      {initial}
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-start justify-between gap-2 sm:gap-4">
                      <div>
                        <p className="text-[15px] font-semibold leading-tight text-text-primary">{comment.author}</p>
                        <time
                          className="mt-0.5 block text-xs font-medium text-text-label"
                          dateTime={comment.createdAt ?? undefined}
                        >
                          {dateLabel}
                        </time>
                      </div>
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(comment)}
                        className="shrink-0 rounded-lg border border-red-200 bg-red-50 px-2 py-1 text-xs font-semibold text-red-600 transition-colors hover:bg-red-100"
                        aria-label="Delete this comment"
                      >
                        Delete
                      </button>
                    </div>
                    <p className="mt-3 whitespace-pre-wrap text-[15px] leading-relaxed text-text-secondary">{comment.content}</p>
                  </div>
                </article>
              </li>
            );
          })}
        </ul>
      )}

      <AddCommentModal
        open={addModalOpen}
        onClose={() => {
          setAddModalOpen(false);
          setAddSubmitError('');
        }}
        onSubmit={handleAddSubmit}
        loading={loading}
        submitError={addSubmitError}
      />

      <ConfirmDeleteModal
        open={deleteTarget !== null}
        title="Delete comment?"
        message={
          deleteTarget
            ? `This will permanently remove the comment${
                deleteTarget.content.length > 80
                  ? ` (“${deleteTarget.content.slice(0, 80)}…”)`
                  : deleteTarget.content
                  ? ` (“${deleteTarget.content}”)`
                  : ''
              }.`
            : ''
        }
        confirmLabel="Delete"
        cancelLabel="Cancel"
        loading={deleting}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
