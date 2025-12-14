import { Loader2 } from "lucide-react";

interface LoadingStateProps {
  text?: string;
  fullPage?: boolean;
}

export function LoadingState({ text = "Loading...", fullPage = false }: LoadingStateProps) {
  return (
    <div className={`flex items-center justify-center ${fullPage ? "min-h-[60vh]" : "h-full"}`}>
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin text-Tonstores-green mx-auto mb-4" />
        <p className="text-gray-500">{text}</p>
      </div>
    </div>
  );
} 