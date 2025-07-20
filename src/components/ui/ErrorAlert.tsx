interface ErrorAlertProps {
  error: string;
}

export default function ErrorAlert({ error }: ErrorAlertProps) {
  return (
    <div className="h-6 flex items-center transition-all duration-300 ease-in-out">
      {error && (
        <div className="w-full p-2 bg-red-900/10 border border-red-500 rounded-lg animate-pulse">
          <p className="text-red-400 text-xs">{error}</p>
        </div>
      )}
    </div>
  );
}
