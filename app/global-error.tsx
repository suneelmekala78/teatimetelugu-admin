"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="flex min-h-screen items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4 text-center">
          <h2 className="text-xl font-semibold text-gray-900">
            Something went wrong
          </h2>
          <p className="text-sm text-gray-500">
            {error.digest ? `Error ID: ${error.digest}` : "An unexpected error occurred."}
          </p>
          <button
            onClick={reset}
            className="rounded-md bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
