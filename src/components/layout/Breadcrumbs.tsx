import { Link, useLocation } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";

type BreadcrumbRoute = {
  path: string;
  label: string;
};

const routes: Record<string, BreadcrumbRoute[]> = {
  "/dashboard": [
    { path: "/dashboard", label: "Dashboard" }
  ],
  "/catalog/new": [
    { path: "/dashboard", label: "Dashboard" },
    { path: "/catalog/new", label: "New Catalog" }
  ],
  "/catalog": [
    { path: "/dashboard", label: "Dashboard" },
    { path: "#", label: "Edit Catalog" }
  ],
  "/orders": [
    { path: "/dashboard", label: "Dashboard" },
    { path: "/orders", label: "Orders" }
  ],
  "/settings": [
    { path: "/dashboard", label: "Dashboard" },
    { path: "/settings", label: "Settings" }
  ],
  "/analytics": [
    { path: "/dashboard", label: "Dashboard" },
    { path: "/analytics", label: "Analytics" }
  ]
};

export default function Breadcrumbs() {
  const location = useLocation();
  const currentPath = location.pathname;
  
  // Find the matching breadcrumb path
  const getMatchingPath = () => {
    // Exact match
    if (routes[currentPath]) return routes[currentPath];
    
    // Check for edit catalog path (/catalog/:id/edit)
    if (currentPath.match(/\/catalog\/.*\/edit/)) {
      return routes["/catalog"];
    }
    
    // Default to just showing the current path
    return [{ path: currentPath, label: currentPath.split("/").pop() || "Current" }];
  };
  
  const breadcrumbs = getMatchingPath();
  
  return (
    <nav className="flex px-5 py-3 border-b rounded-lg bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700" aria-label="Breadcrumb">
      <ol className="inline-flex items-center space-x-1 md:space-x-3">
        <li className="inline-flex items-center">
          <Link
            to="/"
            className="inline-flex items-center text-sm font-medium text-tonstores-darkgray hover:text-tonstores-darkblue dark:text-gray-300 dark:hover:text-white"
          >
            <Home className="w-4 h-4 mr-2" />
            Home
          </Link>
        </li>
        
        {breadcrumbs.map((breadcrumb, index) => (
          <li key={index}>
            <div className="flex items-center">
              <ChevronRight className="w-4 h-4 text-gray-400 dark:text-gray-500" />
              <Link
                to={breadcrumb.path}
                className={`ml-1 text-sm font-medium md:ml-2 ${
                  index === breadcrumbs.length - 1 
                    ? "text-tonstores-darkblue dark:text-tonstores-lightblue" 
                    : "text-tonstores-darkgray hover:text-tonstores-darkblue dark:text-gray-300 dark:hover:text-white"
                }`}
                aria-current={index === breadcrumbs.length - 1 ? "page" : undefined}
              >
                {breadcrumb.label}
              </Link>
            </div>
          </li>
        ))}
      </ol>
    </nav>
  );
} 