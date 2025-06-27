export function Error({ error, reset }: { error?: Error; reset: () => void }) {
  return (
    <div className="w-full flex flex-col items-center gap-3">
      <h2>Something went wrong!</h2>
      {error && <h3>Details: {error.message}</h3>}
      <button
        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none"
        onClick={() => reset()}
      >
        Retry
      </button>
    </div>
  );
}
