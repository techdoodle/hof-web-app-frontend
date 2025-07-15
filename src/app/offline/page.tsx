'use client';

export default function OfflinePage() {
  const handleTryAgain = () => {
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background text-foreground">
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold">You're Offline</h1>
        <p className="mb-8 text-lg text-gray-600">
          Please check your internet connection and try again.
        </p>
        <button
          onClick={handleTryAgain}
          className="rounded-lg bg-blue-600 px-6 py-3 text-white hover:bg-blue-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    </div>
  );
} 