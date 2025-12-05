import React, { useState, useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { toast } from "@/components/ui/use-toast";
import { Product } from "@/hooks/useProducts";
import { Upload, Image, X, ChevronLeft, ChevronRight } from "lucide-react";
import { DEFAULT_LOW_STOCK_THRESHOLD } from "@/utils/stockConfig";

const productSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  description: z.string().optional(),
  price: z.coerce.number().min(0, "Price cannot be negative"),
  in_stock: z.boolean().default(true),
  image_url: z.string().nullable().optional(),
  image_urls: z.array(z.string()).optional(),
  stock_quantity: z.coerce.number().nullable().optional(),
  low_stock_threshold: z.coerce.number().nullable().optional(),
  track_inventory: z.boolean().default(false),
});

type ProductFormValues = z.infer<typeof productSchema>;

type ProductFormProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ProductFormValues, files?: File[]) => Promise<void>;
  initialData?: Product;
};

const ProductForm = ({ isOpen, onClose, onSubmit, initialData }: ProductFormProps) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [trackInventory, setTrackInventory] = useState<boolean>(
    initialData?.stock_quantity !== undefined && initialData?.stock_quantity !== null
  );

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: initialData?.name || "",
      description: initialData?.description || "",
      price: initialData?.price ? initialData.price / 100 : 0, // Convert from kobo to naira for display
      in_stock: initialData?.in_stock ?? true,
      image_url: initialData?.image_url || null,
      image_urls: initialData?.image_urls || [],
      stock_quantity: initialData?.stock_quantity ?? null,
      low_stock_threshold: initialData?.low_stock_threshold ?? DEFAULT_LOW_STOCK_THRESHOLD,
      track_inventory: initialData?.stock_quantity !== undefined && initialData?.stock_quantity !== null,
    }
  });

  // Initialize preview URLs from initialData
  useEffect(() => {
    if (initialData) {
      if (initialData.image_urls && initialData.image_urls.length > 0) {
        setPreviewUrls(initialData.image_urls);
      } else if (initialData.image_url) {
        setPreviewUrls([initialData.image_url]);
      }
      
      // Reset form with initialData values when it changes
      form.reset({
        name: initialData.name || "",
        description: initialData.description || "",
        price: initialData.price ? initialData.price / 100 : 0,
        in_stock: initialData.in_stock ?? true,
        image_url: initialData.image_url || null,
        image_urls: initialData.image_urls || [],
        stock_quantity: initialData.stock_quantity ?? null,
        low_stock_threshold: initialData.low_stock_threshold ?? DEFAULT_LOW_STOCK_THRESHOLD,
        track_inventory: initialData.stock_quantity !== undefined && initialData.stock_quantity !== null,
      });
    } else {
      setPreviewUrls([]);
      form.reset({
        name: "",
        description: "",
        price: 0,
        in_stock: true,
        image_url: null,
        image_urls: [],
        stock_quantity: null,
        low_stock_threshold: DEFAULT_LOW_STOCK_THRESHOLD,
        track_inventory: false,
      });
    }
  }, [initialData, form]);

  // Add this useEffect to log values for debugging
  useEffect(() => {
    if (initialData) {
      console.log("ProductForm initialData:", {
        name: initialData.name,
        description: initialData.description,
        formValues: form.getValues()
      });
    }
  }, [initialData, form]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      // Limit to 3 files
      const newFiles = Array.from(files).slice(0, 3 - previewUrls.length);
      
      if (newFiles.length + previewUrls.length > 3) {
        toast({
          title: "Maximum images reached",
          description: "You can upload a maximum of 3 images per product.",
          variant: "destructive",
        });
        return;
      }
      
      setSelectedFiles(prev => [...prev, ...newFiles]);
      
      // Create object URLs for preview
      const newPreviewUrls = newFiles.map(file => URL.createObjectURL(file));
      const updatedPreviewUrls = [...previewUrls, ...newPreviewUrls];
      setPreviewUrls(updatedPreviewUrls);
      
      // Set form values
      form.setValue("image_urls", updatedPreviewUrls);
      if (updatedPreviewUrls.length > 0) {
        form.setValue("image_url", updatedPreviewUrls[0]);
      }
    }
  };

  const removeImage = (index: number) => {
    // Create a new array without the removed image
    const newPreviewUrls = [...previewUrls];
    newPreviewUrls.splice(index, 1);
    setPreviewUrls(newPreviewUrls);
    
    // Handle selected files (newly added files that haven't been uploaded yet)
    const newSelectedFiles = [...selectedFiles];
    if (index < selectedFiles.length) {
      newSelectedFiles.splice(index, 1);
      setSelectedFiles(newSelectedFiles);
    }
    
    // Adjust current image index if needed
    if (currentImageIndex >= newPreviewUrls.length) {
      setCurrentImageIndex(Math.max(0, newPreviewUrls.length - 1));
    }
    
    // Update form values with the new URLs array
    form.setValue("image_urls", newPreviewUrls);
    
    // Update the main image_url based on remaining images
    if (newPreviewUrls.length === 0) {
      form.setValue("image_url", null);
    } else {
      form.setValue("image_url", newPreviewUrls[0]);
    }
    
    console.log("After removing image:", {
      previewUrls: newPreviewUrls,
      formImageUrls: form.getValues("image_urls"),
      formImageUrl: form.getValues("image_url")
    });
  };

  const nextImage = () => {
    if (previewUrls.length > 1) {
      setCurrentImageIndex((prev) => (prev + 1) % previewUrls.length);
    }
  };

  const prevImage = () => {
    if (previewUrls.length > 1) {
      setCurrentImageIndex((prev) => (prev - 1 + previewUrls.length) % previewUrls.length);
    }
  };

  const handleSubmit = async (data: ProductFormValues) => {
    try {
      setIsSubmitting(true);
      
      // Check if form data has actually changed before submitting
      if (initialData) {
        const hasChanged = 
          data.name !== initialData.name ||
          data.description !== (initialData.description || "") ||
          Math.abs(data.price - (initialData.price / 100)) > 0.01 ||
          data.in_stock !== initialData.in_stock ||
          (data.track_inventory !== (initialData.stock_quantity !== undefined && initialData.stock_quantity !== null)) ||
          (data.track_inventory && data.stock_quantity !== initialData.stock_quantity) ||
          (data.track_inventory && data.low_stock_threshold !== initialData.low_stock_threshold) ||
          selectedFiles.length > 0 ||
          (initialData.image_urls?.length || 0) !== previewUrls.length;
        
        if (!hasChanged) {
          toast({
            title: "No changes detected",
            description: "No changes were made to the product.",
          });
          onClose();
          return;
        }
      }
      
      // If not tracking inventory, set stock-related fields to null
      if (!data.track_inventory) {
        data.stock_quantity = null;
        data.low_stock_threshold = null;
      }
      
      // Convert price from naira to kobo for storage
      // Make sure to filter out any invalid URLs
      const filteredPreviewUrls = previewUrls.filter(url => 
        typeof url === 'string' && url.trim() !== ""
      );
      
      const formData = {
        ...data,
        price: Math.round(data.price * 100),
        image_urls: filteredPreviewUrls,
        image_url: filteredPreviewUrls.length > 0 ? filteredPreviewUrls[0] : null,
      };
      
      // Only pass files that were actually selected in this session,
      // not the ones that were already uploaded
      await onSubmit(formData, selectedFiles.length > 0 ? selectedFiles : undefined);
      onClose();
    } catch (error: any) {
      console.error("Error submitting product:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to save product.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {initialData ? "Edit Product" : "Add New Product"}
          </DialogTitle>
          <DialogDescription>
            {initialData ? "Make changes to your product here." : "Add the details of your new product below."}
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="mb-6 flex flex-col items-center justify-center">
              <div className="w-full max-w-[200px] aspect-square relative rounded-md overflow-hidden mb-4 border border-gray-200 bg-gray-50 flex items-center justify-center">
                {previewUrls.length > 0 ? (
                  <>
                    <img 
                      src={previewUrls[currentImageIndex]} 
                      alt={`Product preview ${currentImageIndex + 1}`} 
                      className="w-full h-full object-cover" 
                    />
                    {previewUrls.length > 1 && (
                      <>
                        <Button
                          variant="secondary"
                          size="icon"
                          className="absolute left-1 top-1/2 transform -translate-y-1/2 w-8 h-8 rounded-full opacity-80 hover:opacity-100"
                          onClick={(e) => {
                            e.preventDefault();
                            prevImage();
                          }}
                        >
                          <ChevronLeft size={16} />
                        </Button>
                        <Button
                          variant="secondary"
                          size="icon"
                          className="absolute right-1 top-1/2 transform -translate-y-1/2 w-8 h-8 rounded-full opacity-80 hover:opacity-100"
                          onClick={(e) => {
                            e.preventDefault();
                            nextImage();
                          }}
                        >
                          <ChevronRight size={16} />
                        </Button>
                        <Button
                          variant="destructive"
                          size="icon"
                          className="absolute top-1 right-1 w-6 h-6 rounded-full opacity-80 hover:opacity-100"
                          onClick={(e) => {
                            e.preventDefault();
                            removeImage(currentImageIndex);
                          }}
                        >
                          <X size={12} />
                        </Button>
                        <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white px-2 py-1 rounded-full text-xs">
                          {currentImageIndex + 1}/{previewUrls.length}
                        </div>
                      </>
                    )}
                  </>
                ) : (
                  <Image size={64} className="text-gray-300" />
                )}
              </div>
              
              <div className="flex flex-col gap-2 items-center">
                <label className="cursor-pointer">
                  <div className="flex items-center gap-2 bg-tonstores-blue bg-opacity-10 hover:bg-opacity-20 text-tonstores-blue px-4 py-2 rounded-md text-sm">
                    <Upload size={16} />
                    <span>{previewUrls.length > 0 ? "Add Image" : "Upload Image"}</span>
                  </div>
                  <input 
                    type="file" 
                    onChange={handleFileChange}
                    accept="image/*" 
                    className="hidden"
                    disabled={previewUrls.length >= 3}
                  />
                </label>
                <p className="text-xs text-gray-500">Upload up to 3 images (1 required)</p>
                
                {previewUrls.length > 0 && (
                  <div className="flex gap-2 mt-2">
                    {previewUrls.map((url, index) => (
                      <div 
                        key={index}
                        className={`w-8 h-8 rounded-md overflow-hidden border-2 cursor-pointer ${
                          index === currentImageIndex ? 'border-tonstores-blue' : 'border-gray-200'
                        }`}
                        onClick={() => setCurrentImageIndex(index)}
                      >
                        <img src={url} alt={`Thumbnail ${index + 1}`} className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter product name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Describe your product" 
                      className="min-h-[100px]" 
                      {...field} 
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price (₦)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder="0.00" 
                      {...field}
                      onChange={(e) => {
                        // Handle numeric input with precision
                        field.onChange(e.target.valueAsNumber || 0);
                      }}
                      min={0}
                      step={0.01}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="track_inventory"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between">
                  <div className="space-y-0">
                    <FormLabel>Track Inventory</FormLabel>
                    <p className="text-sm text-gray-500">Enable stock quantity tracking</p>
                  </div>
                  <FormControl>
                    <Switch 
                      checked={field.value} 
                      onCheckedChange={(value) => {
                        field.onChange(value);
                        setTrackInventory(value);
                      }}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            
            {form.watch('track_inventory') && (
              <>
                <FormField
                  control={form.control}
                  name="stock_quantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Stock Quantity</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="0" 
                          {...field}
                          onChange={(e) => {
                            field.onChange(e.target.valueAsNumber || 0);
                          }}
                          min={0}
                          value={field.value === null ? '' : field.value}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="low_stock_threshold"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Low Stock Threshold</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="5" 
                          {...field}
                          onChange={(e) => {
                            field.onChange(e.target.valueAsNumber || DEFAULT_LOW_STOCK_THRESHOLD);
                          }}
                          min={1}
                          value={field.value === null ? DEFAULT_LOW_STOCK_THRESHOLD : field.value}
                        />
                      </FormControl>
                      <FormMessage />
                      <p className="text-xs text-gray-500">You'll be notified when stock falls below this number</p>
                    </FormItem>
                  )}
                />
              </>
            )}
            
            <FormField
              control={form.control}
              name="in_stock"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between">
                  <div className="space-y-0">
                    <FormLabel>In Stock</FormLabel>
                    <p className="text-sm text-gray-500">Is this product available for purchase?</p>
                  </div>
                  <FormControl>
                    <Switch 
                      checked={field.value} 
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            
            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || previewUrls.length === 0}
              >
                {isSubmitting ? "Saving..." : initialData ? "Save Changes" : "Add Product"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default ProductForm;
