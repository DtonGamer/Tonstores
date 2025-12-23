import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { useSubscriptionLimits } from "./useSubscriptionLimits";
import { DEFAULT_LOW_STOCK_THRESHOLD, getStockStatus, StockStatus } from "@/utils/stockConfig";

export type Product = {
  id?: string;
  catalog_id: string;
  name: string;
  description?: string | null;
  price: number;
  image_url?: string | null;
  image_urls?: string[] | null;
  in_stock: boolean;
  stock_quantity?: number | null;
  low_stock_threshold?: number | null;
  created_at?: string;
  updated_at?: string;
};

interface ProductsQueryOptions {
  limit?: number;
  offset?: number;
  countOnly?: boolean;
}

export const useProducts = (catalogId?: string) => {
  const [isLoading, setIsLoading] = useState(false);
  const { canAddProductToCatalog } = useSubscriptionLimits();

  // Use ref to track if we've shown the toast for this session
  const lowStockToastShown = useRef<Set<string>>(new Set());

  const getProductStockStatus = (product: Product): StockStatus => {
    if (product.stock_quantity === undefined || product.stock_quantity === null) {
      return product.in_stock ? 'normal' : 'out';
    }
    
    const threshold = product.low_stock_threshold ?? DEFAULT_LOW_STOCK_THRESHOLD;
    return getStockStatus(product.stock_quantity, threshold);
  };

  const hasLowStock = (product: Product): boolean => {
    return getProductStockStatus(product) === 'low';
  };
  
  const getLowStockProducts = async (catId: string = catalogId || "") => {
    const products = await getProducts(catId);
    return Array.isArray(products) ? products.filter(product => hasLowStock(product)) : [];
  };

  const getProducts = async (catalogId: string, options?: ProductsQueryOptions) => {
    try {
      setIsLoading(true);
      
      if (options?.countOnly) {
        // If we only need the count, make a more efficient query
        const { count, error } = await supabase
          .from("products")
          .select("*", { count: 'exact', head: true })
          .eq("catalog_id", catalogId);
        
        if (error) throw error;
        return count || 0;
      }
      
      // Build the query with pagination if provided
      let query = supabase
        .from("products")
        .select("*")
        .eq("catalog_id", catalogId)
        .order("created_at", { ascending: false });
      
      // Apply pagination if options are provided
      if (options?.limit) {
        query = query.limit(options.limit);
      }
      
      if (options?.offset !== undefined) {
        query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      // Check for low stock items and show notification
      if (Array.isArray(data)) {
        const lowStockItems = data.filter(product => {
          if (product.stock_quantity === null || product.stock_quantity === undefined) {
            return false;
          }
          const threshold = product.low_stock_threshold ?? DEFAULT_LOW_STOCK_THRESHOLD;
          return product.stock_quantity > 0 && product.stock_quantity <= threshold;
        });

        // Only show toast ONCE per session for this catalog
        if (lowStockItems.length > 0 && !lowStockToastShown.current.has(catalogId)) {
          toast({
            title: "Low Stock Alert",
            description: `${lowStockItems.length} product(s) have low stock levels.`,
            variant: "destructive",
          });

          // Mark as shown for this session
          lowStockToastShown.current.add(catalogId);
        }
      }
      
      return data || [];
    } catch (error: any) {
      console.error("Error fetching products:", error);
      toast({
        title: "Error retrieving products",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const getProduct = async (id: string) => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .single();
      
      if (error) throw error;
      return data;
    } catch (error: any) {
      toast({
        title: "Error retrieving product",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const createProduct = async (productData: Omit<Product, "id" | "created_at" | "updated_at">) => {
    try {
      setIsLoading(true);
      
      const canAdd = await canAddProductToCatalog(productData.catalog_id);
      if (!canAdd) {
        throw new Error("Product limit reached for this catalog");
      }
      
      const { data, error } = await supabase
        .from("products")
        .insert(productData)
        .select()
        .single();
      
      if (error) throw error;
      
      toast({
        title: "Product created",
        description: "Your product has been created successfully",
        variant: "default",
      });
      
      return data;
    } catch (error: any) {
      toast({
        title: "Error creating product",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateProduct = async (id: string, productData: Partial<Product>) => {
    try {
      setIsLoading(true);
      
      // Get the current product data
      const { data: currentProduct, error: fetchError } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .single();
      
      if (fetchError) throw fetchError;
      
      // Compare and only update fields that have actually changed
      const fieldsToUpdate: Record<string, any> = {};
      
      Object.keys(productData).forEach((key) => {
        const typedKey = key as keyof Product;
        if (productData[typedKey] !== currentProduct[typedKey]) {
          fieldsToUpdate[key] = productData[typedKey];
        }
      });
      
      // If no fields have changed, return the current product
      if (Object.keys(fieldsToUpdate).length === 0) {
        return currentProduct;
      }
      
      // Add updated_at timestamp
      fieldsToUpdate.updated_at = new Date().toISOString();
      
      const { data, error } = await supabase
        .from("products")
        .update(fieldsToUpdate)
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      
      toast({
        title: "Product updated",
        description: "Your product has been updated successfully",
        variant: "default",
      });
      
      return data;
    } catch (error: any) {
      toast({
        title: "Error updating product",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      setIsLoading(true);
      
      const { data: orderItemsData, error: orderItemsError } = await supabase
        .from("order_items")
        .select("id")
        .eq("product_id", id)
        .limit(1);
      
      if (orderItemsError) throw orderItemsError;
      
      if (orderItemsData && orderItemsData.length > 0) {
        throw new Error("Cannot delete product with existing orders. Please mark it as out of stock instead.");
      }
      
      const { error } = await supabase
        .from("products")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
      
      toast({
        title: "Product deleted",
        description: "Your product has been deleted successfully",
      });
      
      return true;
    } catch (error: any) {
      toast({
        title: "Error deleting product",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const uploadProductImage = async (file: File): Promise<string> => {
    try {
      setIsLoading(true);
      
      // Validate file size (limit to 10MB)
      if (file.size > 10 * 1024 * 1024) {
        throw new Error("Image file size must be less than 10MB");
      }
      
      // Validate file type
      const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        throw new Error("Only JPEG, PNG, GIF, and WebP images are supported");
      }
      
      // Create a safe filename
      const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const safeExt = ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileExt) ? fileExt : 'jpg';
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${safeExt}`;
      
      // Upload with retry logic
      let attempts = 0;
      const maxAttempts = 3;
      let uploadError = null;
      
      while (attempts < maxAttempts) {
        attempts++;
        
        try {
          const { error } = await supabase
            .storage
            .from('product-images')
            .upload(fileName, file, {
              cacheControl: '3600',
              upsert: false
            });
          
          if (!error) {
            // Upload succeeded
            const { data } = supabase
              .storage
              .from('product-images')
              .getPublicUrl(fileName);
            
            return data.publicUrl;
          }
          
          uploadError = error;
          
          // Wait before retrying
          if (attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        } catch (err) {
          uploadError = err;
        }
      }
      
      // If we got here, all attempts failed
      throw uploadError || new Error("Failed to upload image after multiple attempts");
    } catch (error: any) {
      console.error("Image upload error:", error);
      toast({
        title: "Error uploading image",
        description: error.message || "Failed to upload image",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  
  const uploadMultipleProductImages = async (files: File[]): Promise<string[]> => {
    try {
      setIsLoading(true);
      
      // Validate all files first
      for (const file of files) {
        // Validate file size (limit to 10MB)
        if (file.size > 10 * 1024 * 1024) {
          throw new Error(`Image "${file.name}" exceeds the 10MB size limit`);
        }
        
        // Validate file type
        const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (!validTypes.includes(file.type)) {
          throw new Error(`File "${file.name}" is not a supported image type. Use JPEG, PNG, GIF, or WebP`);
        }
      }
      
      // Process uploads sequentially to avoid overwhelming the server
      const results: string[] = [];
      
      for (const file of files) {
        try {
          // Create a safe filename
          const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
          const safeExt = ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileExt) ? fileExt : 'jpg';
          const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${safeExt}`;
          
          // Upload with retry logic
          let attempts = 0;
          const maxAttempts = 3;
          let uploadError = null;
          let uploaded = false;
          
          while (attempts < maxAttempts && !uploaded) {
            attempts++;
            
            try {
              const { error } = await supabase
                .storage
                .from('product-images')
                .upload(fileName, file, {
                  cacheControl: '3600',
                  upsert: false
                });
              
              if (!error) {
                // Upload succeeded
                const { data } = supabase
                  .storage
                  .from('product-images')
                  .getPublicUrl(fileName);
                
                results.push(data.publicUrl);
                uploaded = true;
              } else {
                uploadError = error;
                
                // Wait before retrying
                if (attempts < maxAttempts) {
                  await new Promise(resolve => setTimeout(resolve, 1000));
                }
              }
            } catch (err) {
              uploadError = err;
              
              // Wait before retrying
              if (attempts < maxAttempts) {
                await new Promise(resolve => setTimeout(resolve, 1000));
              }
            }
          }
          
          // If we couldn't upload this file after all attempts
          if (!uploaded) {
            throw uploadError || new Error(`Failed to upload image "${file.name}" after multiple attempts`);
          }
        } catch (error) {
          console.error("Error uploading file:", file.name, error);
          throw error;
        }
      }
      
      return results;
    } catch (error: any) {
      console.error("Multiple image upload error:", error);
      toast({
        title: "Error uploading images",
        description: error.message || "Failed to upload one or more images",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateStockQuantity = async (id: string, quantity: number) => {
    try {
      setIsLoading(true);
      
      const safeQuantity = Math.max(0, quantity);
      
      const inStock = safeQuantity > 0;
      
      const { data, error } = await supabase
        .from("products")
        .update({
          stock_quantity: safeQuantity,
          in_stock: inStock,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      
      const threshold = data.low_stock_threshold ?? DEFAULT_LOW_STOCK_THRESHOLD;
      if (safeQuantity > 0 && safeQuantity <= threshold) {
        toast({
          title: "Low Stock Alert",
          description: `${data.name} is running low on stock (${safeQuantity} remaining).`,
          variant: "destructive",
        });
      }
      
      return data;
    } catch (error: any) {
      toast({
        title: "Error updating stock",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    getProducts,
    getProduct,
    createProduct,
    updateProduct,
    deleteProduct,
    uploadProductImage,
    uploadMultipleProductImages,
    getProductStockStatus,
    hasLowStock,
    getLowStockProducts,
    updateStockQuantity,
    isLoading,
  };
};
