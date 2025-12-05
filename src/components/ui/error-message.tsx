import { AlertCircle } from "lucide-react";
import { Button } from "./button";

interface ErrorMessageProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  retryText?: string;
}

export function ErrorMessage({ title = "Error", message, onRetry, retryText = "Try Again" }: ErrorMessageProps) {
  return (
    <div className="flex flex-col items-center justify-center p-6 bg-red-50 rounded-lg my-4">
      <AlertCircle className="h-8 w-8 text-red-500 mb-3" />
      <h3 className="text-lg font-semibold text-red-700 mb-2">{title}</h3>
      <p className="text-red-600 text-center mb-4">{message}</p>
      {onRetry && (
        <Button variant="outline" onClick={onRetry}>
          {retryText}
        </Button>
      )}
    </div>
  );
} 