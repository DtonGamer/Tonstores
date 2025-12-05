import React from "react";
import { PageViewTracker } from "@/components/analytics/PageViewTracker";

interface PublicLayoutWithTrackingProps {
  children: React.ReactNode;
}

// Public layout that includes page view tracking
export const PublicLayoutWithTracking: React.FC<PublicLayoutWithTrackingProps> = ({ children }) => {
  return (
    <>
      <PageViewTracker />
      {children}
    </>
  );
};