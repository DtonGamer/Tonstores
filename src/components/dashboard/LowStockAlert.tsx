import { useState, useEffect } from "react";
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
  
  useEffect(() => {
    const checkLowStock = async () => {
      try {
        // Check if we've already shown the alert for this catalog in this session
        const lastAlertTime = localStorage.getItem(`lowStockAlert_${catalogId}`);
        const now = Date.now();
        
        // Only show alert if we haven't shown it in the last hour
        if (!lastAlertTime || (now - parseInt(lastAlertTime)) > 3600000) {
          const lowStockItems = await getLowStockProducts();
          setLowStockCount(lowStockItems.length);
          setIsVisible(lowStockItems.length > 0);
          
          // If we have low stock items, update the last alert time
          if (lowStockItems.length > 0) {
            localStorage.setItem(`lowStockAlert_${catalogId}`, now.toString());
          }
        }
      } catch (error) {
        console.error("Error checking low stock:", error);
      }
    };
    
    checkLowStock();
  }, [catalogId, getLowStockProducts]);
  
  const handleDismiss = () => {
    setIsVisible(false);
    // Update the last alert time when manually dismissed
    localStorage.setItem(`lowStockAlert_${catalogId}`, Date.now().toString());
  };
  
  if (!isVisible) return null;
  
  return (
    <div className="bg-amber-50 border-l-4 border-amber-500 p-4 mb-6 relative">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <AlertTriangle className="h-5 w-5 text-amber-500" />
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-amber-800">
            Low Stock Alert
          </h3>
          <div className="mt-1 text-sm text-amber-700">
            <p>
              {lowStockCount} {lowStockCount === 1 ? 'product has' : 'products have'} low stock levels.
              Please review your inventory and restock if needed.
            </p>
          </div>
          <div className="mt-3">
            <Button 
              variant="outline" 
              size="sm"
              className="text-amber-800 bg-amber-100 border-amber-200 hover:bg-amber-200"
              onClick={() => navigate(`/catalog/${catalogId}/edit`, { state: { activeTab: 'products' } })}
            >
              View Products <ArrowRight size={14} className="ml-1" />
            </Button>
          </div>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          className="absolute top-2 right-2 h-6 w-6 p-0 rounded-full"
          onClick={handleDismiss}
        >
          <X size={14} />
        </Button>
      </div>
    </div>
  );
};

export default LowStockAlert; 