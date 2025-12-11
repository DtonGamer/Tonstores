import React from "react";

interface TikTokIconProps {
  size?: number;
  className?: string;
}

const TikTokIcon: React.FC<TikTokIconProps> = ({ size = 16, className = "" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path 
      d="M19.321 5.562a5.124 5.124 0 0 1-1.38 1.015 5.086 5.086 0 0 1-1.616.518V9.39a5.052 5.052 0 0 1-2.299-.56v3.947a5.16 5.16 0 0 1-1.378 3.53 5.2 5.2 0 0 1-7.313.01 5.161 5.161 0 0 1 0-7.313 5.2 5.2 0 0 1 7.313.01c.011.01.02.022.03.032V5.332A9.885 9.885 0 0 0 10.95 4.4a9.9 9.9 0 0 0-5.213 1.495 9.938 9.938 0 0 0-3.595 4.144A9.892 9.892 0 0 0 1.2 14.91a9.958 9.958 0 0 0 2.892 7.024 9.958 9.958 0 0 0 6.817 2.866h.082a9.958 9.958 0 0 0 7.024-2.866 9.958 9.958 0 0 0 2.866-7.024V8.593a9.885 9.885 0 0 0 4.92 1.3V5.783a5.07 5.07 0 0 1-2.766-.768 5.16 5.16 0 0 1-1.815-1.816 5.07 5.07 0 0 1-.769-2.766h-3.109c.002 1.088.287 2.156.829 3.13z"
      fill="currentColor" 
    />
  </svg>
);

export default TikTokIcon;