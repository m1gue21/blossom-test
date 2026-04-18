import { useEffect, useState } from 'react';

interface AddCommentModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (author: string, content: string) => Promise<void>;
  loading?: boolean;
  /** Error from the server after submit */
  submitError?: string;
}

export function AddCommentModal({
  open,
  onClose,
  onSubmit,
  loading = false,
  submitError = '',
}: AddCommentModalProps) {
  const [author, setAuthor] = useState('');
  const [content, setContent] = useState('');
  const [localError, setLocalError] = useState('');

  useEffect(() => {
    if (!open) return;
    setAuthor('');
    setContent('');
    setLocalError('');
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !loading) onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, loading, onClose]);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');
    if (!author.trim() || !content.trim()) {
      setLocalError('Please fill in both fields');
      return;
    }
    await onSubmit(author.trim(), content.trim());
  };

  const displayError = localError || submitError;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-comment-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
        onClick={() => !loading && onClose()}
        aria-label="Close dialog"
      />
      <div
        className="relative w-full max-w-lg animate-slide-down rounded-2xl border border-border bg-white p-6 shadow-2xl sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h2 id="add-comment-title" className="text-lg font-semibold tracking-tight text-text-primary">
              New comment
            </h2>
            <p className="mt-1 text-sm text-text-secondary">Share a note about this character.</p>
          </div>
          <button
            type="button"
            onClick={() => !loading && onClose()}
            disabled={loading}
            className="rounded-lg p-2 text-text-label transition-colors hover:bg-surface hover:text-text-primary disabled:opacity-50"
            aria-label="Close"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden>
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="add-comment-author" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-text-label">
              Your name
            </label>
            <input
              id="add-comment-author"
              type="text"
              placeholder="e.g. Alex"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              maxLength={100}
              disabled={loading}
              className="w-full rounded-xl border border-border bg-white px-4 py-3 text-sm text-text-primary placeholder-text-label outline-none transition-all focus:border-primary-600 focus:ring-2 focus:ring-primary-100 disabled:opacity-50"
              data-testid="comment-author"
              autoComplete="name"
            />
          </div>
          <div>
            <label htmlFor="add-comment-content" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-text-label">
              Comment
            </label>
            <textarea
              id="add-comment-content"
              placeholder="Write your thoughts..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={4}
              disabled={loading}
              className="w-full resize-none rounded-xl border border-border bg-white px-4 py-3 text-sm text-text-primary placeholder-text-label outline-none transition-all focus:border-primary-600 focus:ring-2 focus:ring-primary-100 disabled:opacity-50"
              data-testid="comment-content"
            />
          </div>
          {displayError ? (
            <p className="text-sm text-red-600" role="alert">
              {displayError}
            </p>
          ) : null}
          <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => !loading && onClose()}
              disabled={loading}
              className="rounded-xl border border-border bg-white px-5 py-3 text-sm font-semibold text-text-primary transition-colors hover:bg-surface disabled:opacity-50 sm:min-w-[120px]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-primary-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-700 disabled:opacity-50 sm:min-w-[140px]"
              data-testid="comment-submit"
            >
              {loading ? 'Posting…' : 'Post comment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
