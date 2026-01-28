export const ErrorCard = ({
  message,
  error,
}: {
  message: string;
  error: Error | string;
}) => {
  const errorMessage = error instanceof Error ? error.message : error;

  return (
    <div className="w-full flex flex-col items-center justify-start gap-4">
      <div className="card card-border bg-error/10 border-error w-96">
        <div className="card-body items-center text-center">
          <h2 className="card-title text-error">{message}</h2>
          <p className="text-error/80">{errorMessage}</p>
        </div>
      </div>
    </div>
  );
};
