import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-8">
      <p className="text-6xl mb-4">🌀</p>
      <h1 className="text-3xl font-bold text-text-primary mb-2">404</h1>
      <p className="text-text-secondary mb-6">This dimension doesn't exist.</p>
      <Link
        to="/"
        className="px-5 py-2.5 bg-primary-600 text-white font-semibold text-sm rounded-xl hover:bg-primary-700 transition-colors"
      >
        Back to Characters
      </Link>
    </div>
  );
}
