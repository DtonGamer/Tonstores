import { Button } from "@/components/ui/button";
import { ReloadIcon } from "@radix-ui/react-icons";

interface LoadingStateProps {
  message?: string;
}

export const LoadingState = ({ message = "Loading..." }: LoadingStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <ReloadIcon className="h-12 w-12 animate-spin text-Tonstores-green mb-4" />
      <p className="text-lg text-gray-600">{message}</p>
    </div>
  );
};

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
  retryMessage?: string;
}

export const ErrorState = ({ 
  message = "An error occurred", 
  onRetry,
  retryMessage = "Retry"
}: ErrorStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="bg-red-100 text-red-700 p-4 rounded-full mb-4">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
      <p className="text-lg text-gray-700 mb-4 text-center">{message}</p>
      {onRetry && (
        <Button onClick={onRetry} variant="default">
          {retryMessage}
        </Button>
      )}
    </div>
  );
};

interface DataLoadStateProps {
  loading: boolean;
  error: string | null;
  onRetry?: () => void;
  loadingMessage?: string;
  children: React.ReactNode;
}

export const DataLoadState = ({ 
  loading, 
  error, 
  onRetry, 
  loadingMessage,
  children 
}: DataLoadStateProps) => {
  if (loading) {
    return <LoadingState message={loadingMessage} />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={onRetry} />;
  }

  return <>{children}</>;
};