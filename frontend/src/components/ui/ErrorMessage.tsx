interface ErrorMessageProps {
  message?: string;
  onRetry?: () => void;
}

export function ErrorMessage({ message = 'Something went wrong', onRetry }: ErrorMessageProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
      <div className="text-6xl">☠️</div>
      <p className="text-red-400 text-lg font-medium">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-rm-green text-black font-semibold rounded-lg hover:bg-green-400 transition-colors"
        >
          Try Again
        </button>
      )}
    </div>
  );
}
