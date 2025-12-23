import { useState, useEffect, useRef } from "react";
import { useProducts } from "@/hooks/useProducts";
import { AlertTriangle, X, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

type LowStockAlertProps = {
  catalogId: string;
};

const LowStockAlert = ({ catalogId }: LowStockAlertProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [lowStockCount, setLowStockCount] = useState(0);
  const { getLowStockProducts } = useProducts(catalogId);
  const navigate = useNavigate();
  
  // Use ref to ensure we only check once per mount
  const hasChecked = useRef(false);
  
  useEffect(() => {
    // Prevent multiple checks
    if (hasChecked.current) return;
    
    const checkLowStock = async () => {
      try {
        // Check if we've already shown the alert for this catalog in this session
        const sessionKey = `lowStockAlertShown_${catalogId}`;
        const alreadyShownThisSession = sessionStorage.getItem(sessionKey);
        
        // Don't show again if already shown this session
        if (alreadyShownThisSession === 'true') {
          hasChecked.current = true;
          return;
        }
        
        const lowStockItems = await getLowStockProducts();
        setLowStockCount(lowStockItems.length);
        setIsVisible(lowStockItems.length > 0);
        
        // Mark as shown for this session
        if (lowStockItems.length > 0) {
          sessionStorage.setItem(sessionKey, 'true');
        }
        
        hasChecked.current = true;
      } catch (error) {
        console.error("Error checking low stock:", error);
        hasChecked.current = true;
      }
    };
    
    checkLowStock();
  }, [catalogId, getLowStockProducts]);
  
  const handleDismiss = () => {
    setIsVisible(false);
  };
  
  if (!isVisible) return null;
  
  return (
    <div className="bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-500 p-4 mb-6 relative">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <AlertTriangle className="h-5 w-5 text-amber-500" />
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-amber-800 dark:text-amber-300">
            Low Stock Alert
          </h3>
          <div className="mt-1 text-sm text-amber-700 dark:text-amber-400">
            <p>
              {lowStockCount} {lowStockCount === 1 ? 'product has' : 'products have'} low stock levels.
              Please review your inventory and restock if needed.
            </p>
          </div>
          <div className="mt-3">
            <Button 
              variant="outline" 
              size="sm"
              className="text-amber-800 dark:text-amber-300 bg-amber-100 dark:bg-amber-900/30 border-amber-200 dark:border-amber-700 hover:bg-amber-200 dark:hover:bg-amber-900/50"
              onClick={() => navigate(`/catalog/${catalogId}/edit`, { state: { activeTab: 'products' } })}
            >
              View Products <ArrowRight size={14} className="ml-1" />
            </Button>
          </div>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          className="absolute top-2 right-2 h-6 w-6 p-0 rounded-full hover:bg-amber-200 dark:hover:bg-amber-900/50"
          onClick={handleDismiss}
        >
          <X size={14} />
        </Button>
      </div>
    </div>
  );
};

export default LowStockAlert;