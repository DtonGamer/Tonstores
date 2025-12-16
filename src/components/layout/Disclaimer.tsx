import { useState } from "react";

export function Disclaimer() {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div
      className={`
        fixed bottom-0 left-0 right-0 py-2 px-4
        bg-white bg-opacity-90 dark:bg-gray-800 dark:bg-opacity-90
        shadow-md text-center
        border-t border-gray-200 dark:border-gray-700
        z-10 transition-transform duration-300
        ${!isVisible ? "translate-y-full" : "translate-y-0"}
      `}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      <div className="absolute -top-6 left-0 right-0 h-6 bg-transparent" />
      <p className="text-xs italic text-gray-600 dark:text-gray-300">
        Tonstores uses Paystack for secure payments. We are not an official partner.
      </p>
    </div>
  );
}