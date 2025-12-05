import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { usePageViewTracker } from "@/hooks/useEventTracker";

interface AnalyticsLayoutProps {
  children: React.ReactNode;
}

// Layout component that handles analytics for all child routes
export const AnalyticsLayout: React.FC<AnalyticsLayoutProps> = ({ children }) => {
  usePageViewTracker();
  return <>{children}</>;
};