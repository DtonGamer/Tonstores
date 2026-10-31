import React, { useState } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertTriangle, ShoppingCart, ChevronLeft, ChevronRight, X, ImageIcon } from "lucide-react";

// Helper function to get storage URL or handle relative URLs
const getStorageUrl = (url: string | null) => {
  if (!url) return null;
  return url.startsWith("http") ? url : url;
};

const imageDefaults = {
  placeholderImage: "/placeholder.svg"
};

const getStockStatus = (quantity: number, threshold: number) => {
  if (quantity === 0) return 'out';
  if (quantity <= threshold) return 'low';
  return 'normal';
};

type ProductCardProps = {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  imageUrls?: string[];
  inStock: boolean;
  stockQuantity?: number | null;
  lowStockThreshold?: number | null;
  isEditable?: boolean;
  onAddToCart?: (id: string, quantity: number) => void;
  onEdit?: (id: string) => void;
};

const ProductCard = ({ 
  id, 
  name, 
  description, 
  price, 
  imageUrl, 
  imageUrls = [],
  inStock,
  stockQuantity,
  lowStockThreshold,
  isEditable = false,
  onAddToCart,
  onEdit
}: ProductCardProps) => {
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageError, setImageError] = useState(false);
  
  // Use image_urls if available, otherwise fallback to single image_url
  const images = imageUrls.length > 0 
    ? imageUrls.filter(url => url && url.trim() !== "") 
    : (imageUrl && imageUrl.trim() !== "" ? [imageUrl] : []);
  
  const handleAddToCart = () => {
    if (onAddToCart) {
      onAddToCart(id, 1);
    }
  };
  
  const handleEdit = () => {
    if (onEdit) {
      onEdit(id);
    }
  };
  
  const openProductDetail = () => {
    setIsDetailOpen(true);
    setCurrentImageIndex(0);
  };
  
  const nextImage = () => {
    if (images.length > 1) {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }
  };

  const prevImage = () => {
    if (images.length > 1) {
      setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
    }
  };
  
  // Determine stock status
  const stockStatus = stockQuantity !== undefined && stockQuantity !== null
    ? getStockStatus(stockQuantity, lowStockThreshold || 5)
    : (inStock ? 'normal' : 'out');
  
  const isLowStock = stockStatus === 'low';
  
  return (
    <>
      <Card className={`overflow-hidden rounded-2xl border border-border bg-card flex flex-col ${!inStock ? 'opacity-80' : ''}`}>
        <div
          className={`aspect-square overflow-hidden relative bg-muted ${!isEditable ? 'cursor-pointer' : ''}`}
          onClick={!isEditable ? openProductDetail : undefined}
        >
          <img
            src={imageError || images.length === 0 ? imageDefaults.placeholderImage : getStorageUrl(images[0]) || imageDefaults.placeholderImage}
            alt={name}
            className="object-cover w-full h-full"
            onError={() => setImageError(true)}
          />
          {!inStock && (
            <span className="absolute top-2 left-2 rounded-full bg-background border border-border px-2.5 py-0.5 text-[11px] font-bold text-muted-foreground">
              Sold out
            </span>
          )}
          {isLowStock && inStock && (
            <span className="absolute top-2 left-2 rounded-full bg-Tonstores-amber/25 px-2.5 py-0.5 text-[11px] font-bold text-amber-900 dark:text-amber-300">
              Only {stockQuantity} left
            </span>
          )}
          {images.length > 1 && (
            <span className="absolute bottom-2 right-2 rounded-full bg-black/60 text-white px-2 py-0.5 text-[11px] flex items-center">
              <ImageIcon size={12} className="mr-1" /> {images.length}
            </span>
          )}
        </div>
        <CardContent className="p-3 flex-1">
          <h3
            className={`font-semibold text-[15px] leading-snug line-clamp-2 ${!isEditable ? 'cursor-pointer' : ''}`}
            onClick={!isEditable ? openProductDetail : undefined}
          >
            {name}
          </h3>
          {description && (
            <p className="hidden sm:block text-muted-foreground text-sm line-clamp-2 mt-1">{description}</p>
          )}
          <p className="text-lg font-extrabold text-Tonstores-green mt-1">
            ₦{(price / 100).toLocaleString("en-NG", { maximumFractionDigits: 2 })}
          </p>
          {isEditable && stockQuantity !== undefined && stockQuantity !== null && inStock && (
            <p className="text-sm text-muted-foreground mt-1">
              {stockQuantity} {stockQuantity === 1 ? 'item' : 'items'} left
            </p>
          )}
        </CardContent>
        <CardFooter className="p-3 pt-0">
          {isEditable ? (
            <Button className="w-full h-10 bg-Tonstores-darkblue hover:bg-Tonstores-darkblue/90 text-white" onClick={handleEdit}>
              Edit Product
            </Button>
          ) : inStock ? (
            <Button
              variant="outline"
              className="w-full h-10 border-2 border-Tonstores-green text-Tonstores-green bg-transparent hover:bg-Tonstores-green hover:text-white font-bold"
              onClick={handleAddToCart}
            >
              Add to cart
            </Button>
          ) : (
            <Button className="w-full h-10" disabled>Sold out</Button>
          )}
        </CardFooter>
      </Card>
      
      {/* Product Detail Modal - MOBILE OPTIMIZED */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-[100vw] w-full h-[100dvh] max-h-[100dvh] p-0 m-0 rounded-none sm:max-w-[600px] sm:h-auto sm:max-h-[90vh] sm:rounded-lg overflow-hidden flex flex-col">
          {/* Fixed Header */}
          <div className="flex-shrink-0 bg-white dark:bg-gray-950 p-3 sm:p-4 border-b dark:border-gray-800 flex justify-between items-center gap-3">
            <DialogTitle className="text-base sm:text-xl font-bold line-clamp-2 flex-1">{name}</DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsDetailOpen(false)}
              className="rounded-full h-8 w-8 flex-shrink-0"
            >
              <X size={18} />
            </Button>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto overscroll-contain">
            <div className="p-3 sm:p-6">
              <div className="flex flex-col gap-3 sm:gap-6">
                {/* Image gallery */}
                <div className="w-full">
                  {/* Main large image */}
                  <div className="aspect-square bg-gray-50 dark:bg-gray-800 rounded-lg overflow-hidden relative max-h-[45vh] sm:max-h-none">
                    {images.length > 0 ? (
                      <img
                        src={imageError ? imageDefaults.placeholderImage : getStorageUrl(images[currentImageIndex]) || imageDefaults.placeholderImage}
                        alt={name}
                        className="object-contain w-full h-full"
                        onError={() => setImageError(true)}
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <ImageIcon size={48} className="text-gray-400" />
                      </div>
                    )}

                    {isLowStock && inStock && (
                      <div className="absolute top-2 left-2 bg-amber-500 text-white px-2 py-1 text-xs font-medium rounded-full flex items-center">
                        <AlertTriangle size={12} className="mr-1" />
                        <span className="hidden sm:inline">Low Stock - Only {stockQuantity} left</span>
                        <span className="sm:hidden">Low Stock</span>
                      </div>
                    )}

                    {images.length > 1 && (
                      <>
                        <Button
                          variant="secondary"
                          size="icon"
                          className="absolute left-2 top-1/2 transform -translate-y-1/2 w-8 h-8 sm:w-9 sm:h-9 rounded-full opacity-90 hover:opacity-100 "
                          onClick={prevImage}
                        >
                          <ChevronLeft size={16} className="sm:w-[18px] sm:h-[18px]" />
                        </Button>
                        <Button
                          variant="secondary"
                          size="icon"
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 w-8 h-8 sm:w-9 sm:h-9 rounded-full opacity-90 hover:opacity-100 "
                          onClick={nextImage}
                        >
                          <ChevronRight size={16} className="sm:w-[18px] sm:h-[18px]" />
                        </Button>

                        <div className="absolute bottom-2 left-0 right-0 flex justify-center items-center gap-2">
                          <Badge variant="secondary" className="bg-black bg-opacity-70 text-white px-2 py-1 text-xs rounded-full">
                            {currentImageIndex + 1}/{images.length}
                          </Badge>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Thumbnails row */}
                  {images.length > 1 && (
                    <div className="flex gap-2 justify-start overflow-x-auto mt-2 sm:mt-3 pb-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                      {images.map((img, index) => (
                        <div
                          key={index}
                          className={`flex-shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-md overflow-hidden border-2 cursor-pointer transition-all ${
                            index === currentImageIndex ? 'border-Tonstores-green ' : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => setCurrentImageIndex(index)}
                        >
                          <img
                            src={getStorageUrl(img) || imageDefaults.placeholderImage}
                            alt={`${name} thumbnail ${index + 1}`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = imageDefaults.placeholderImage;
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="border-t dark:border-gray-700"></div>

                {/* Product details */}
                <div className="flex flex-col gap-3 sm:gap-6">
                  {/* Price */}
                  <div>
                    <p className="text-2xl sm:text-3xl font-bold text-Tonstores-green">
                      ₦{(price / 100).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                      })}
                    </p>
                  </div>

                  {/* Description */}
                  <div className="bg-gray-50 dark:bg-gray-800/50 p-3 sm:p-4 rounded-lg">
                    <h4 className="font-semibold text-base sm:text-lg mb-2 dark:text-white">Description</h4>
                    <div className="max-h-[150px] sm:max-h-[200px] overflow-y-auto pr-2">
                      <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                        {description || "No description available."}
                      </p>
                    </div>
                  </div>

                  {/* Availability */}
                  {inStock ? (
                    <>
                      {stockQuantity !== undefined && stockQuantity !== null && (
                        <div className={`p-3 sm:p-4 rounded-lg ${isLowStock ? 'bg-amber-50 dark:bg-amber-900/30' : 'bg-green-50 dark:bg-green-900/30'}`}>
                          <h4 className="font-semibold text-base sm:text-lg mb-2 dark:text-white">Availability</h4>
                          <p className={`text-sm sm:text-base ${isLowStock ? 'text-amber-700 dark:text-amber-400' : 'text-green-700 dark:text-green-400'}`}>
                            {isLowStock
                              ? `Low stock - only ${stockQuantity} ${stockQuantity === 1 ? 'item' : 'items'} left`
                              : `In stock (${stockQuantity} available)`}
                          </p>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="bg-red-50 dark:bg-red-900/30 p-3 sm:p-4 rounded-lg">
                      <h4 className="font-semibold text-base sm:text-lg mb-2 dark:text-white">Availability</h4>
                      <p className="text-sm sm:text-base text-red-700 dark:text-red-400">
                        This product is currently out of stock
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Fixed Footer with Add to Cart Button */}
          <div className="flex-shrink-0 p-3 sm:p-4 border-t dark:border-gray-800 bg-white dark:bg-gray-950 ">
            {inStock ? (
              <Button
                className="w-full bg-Tonstores-green hover:bg-Tonstores-greendark text-white py-4 sm:py-6 text-base sm:text-lg font-semibold"
                onClick={() => {
                  handleAddToCart();
                  setIsDetailOpen(false);
                }}
              >
                <ShoppingCart className="mr-2" size={20} />
                Add to Cart
              </Button>
            ) : (
              <Button
                className="w-full py-4 sm:py-6 text-base sm:text-lg font-semibold"
                disabled
              >
                Out of Stock
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ProductCard;
