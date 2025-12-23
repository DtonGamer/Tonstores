import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, useLocation, Link } from "react-router-dom";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import ProductCard from "@/components/catalog/ProductCard";
import ProductForm from "@/components/catalog/ProductForm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/components/ui/use-toast";
import { Save, Eye, Trash2, ArrowLeft, Share2, PlusCircle } from "lucide-react";
import { useCatalog } from "@/hooks/useCatalog";
import { useProducts, Product } from "@/hooks/useProducts";
import useAuth from "@/contexts/AuthContext";
import DeleteConfirmationDialog from "@/components/catalog/DeleteConfirmationDialog";
import CatalogHeader from "@/components/catalog/CatalogHeader";
import ProductsSection from "@/components/catalog/ProductsSection";

// Form schema for catalog
const catalogSchema = z.object({
  name: z.string().min(1, "Catalog name is required"),
  slug: z.string().min(3, "Catalog slug must be at least 3 characters")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must contain only lowercase letters, numbers, and hyphens"),
  description: z.string().optional(),
  is_active: z.boolean().default(false)
});

type CatalogFormValues = z.infer<typeof catalogSchema>;

const CatalogBuilder = () => {
  const params = useParams();
  const location = useLocation();
  const [isNewCatalog, setIsNewCatalog] = useState(window.location.pathname === "/catalog/new");
  const id = isNewCatalog ? "new" : params.id;
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Get activeTab from location state or default to "details"
  const [selectedTab, setSelectedTab] = useState(
    location.state?.activeTab || "details"
  );
  
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Product | undefined>(undefined);
  const [shareableLink, setShareableLink] = useState<string>("");
  const [isGeneratingSlug, setIsGeneratingSlug] = useState(false);
  const [catalogId, setCatalogId] = useState<string | null>(id);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const { getCatalog, createCatalog, updateCatalog, generateUniqueSlug, deleteCatalog } = useCatalog();
  const { 
    getProducts, 
    createProduct, 
    updateProduct, 
    deleteProduct, 
    uploadProductImage,
    uploadMultipleProductImages,
    isLoading: productsLoading 
  } = useProducts();
  
  // Log only once on component mount
  useEffect(() => {
    // console.log("🔍 CatalogBuilder mounted:", { pathname: window.location.pathname, isNewCatalog, id });
  }, []);
  
  const form = useForm<CatalogFormValues>({
    resolver: zodResolver(catalogSchema),
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      is_active: false
    }
  });
  
  // Load catalog and products data
  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      if (!isMounted) return;

      if (!isNewCatalog && !id) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);

        if (!isNewCatalog && id) {
          // Load catalog and products data in parallel for better performance
          const [catalogData, productsData] = await Promise.all([
            getCatalog(id),
            getProducts(id)
          ]);

          if (!catalogData) return;

          if (isMounted) {
            form.reset({
              name: catalogData.name,
              slug: catalogData.slug,
              description: catalogData.description || "",
              is_active: catalogData.is_active
            });

            if (Array.isArray(productsData)) {
              setProducts(productsData);
            }
            setShareableLink(`${window.location.origin}/c/${catalogData.slug}`);
          }
        } else {
          // New catalog, just clear loading
          setIsLoading(false);
        }
      } catch (error: any) {
        if (isMounted) {
          toast({
            title: "Error loading catalog",
            description: error.message,
            variant: "destructive",
          });
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [id, isNewCatalog]);
  
  // Generate slug when name changes - improved version
  const generateSlug = useCallback(async () => {
    const name = form.getValues().name;
    if (!name || name.length < 3) return;
    
    setIsGeneratingSlug(true);
    try {
      let newSlug: string;
      if (isNewCatalog) {
        // just a simple slug-ify, no API hit
        newSlug = name
          .toLowerCase()
          .replace(/[^\w\s-]/g, "")
          .replace(/\s+/g, "-")
          .replace(/-+/g, "-")
          .trim();
        
        // ensure length >= 3
        if (newSlug.length < 3) {
          newSlug = newSlug.padEnd(3, newSlug[0] || "a");
        }
      } else {
        // only call Supabase to check uniqueness for existing catalogs
        newSlug = await generateUniqueSlug(name, catalogId!);
      }
      form.setValue("slug", newSlug);
    } catch (error) {
      toast({
        title: "Error generating slug",
        description: "Please try again or enter a slug manually.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingSlug(false);
    }
  }, [form, isNewCatalog, generateUniqueSlug, catalogId]);
  
  const handleSaveCatalog = async (data: CatalogFormValues) => {
    // console.log("🌟 handleSaveCatalog:", { pathname: window.location.pathname, id, isNewCatalog, data });
    
    // Prevent multiple submissions
    if (isSaving) return;
    
    try {
      setIsSaving(true);
      setIsLoading(true); // Set loading state
      
      if (!user) {
        // console.log("No user found, authentication required");
        toast({
          title: "Authentication required",
          description: "You must be logged in to save a catalog",
          variant: "destructive",
        });
        return;
      }
      
      // Additional validation for slug
      if (data.slug.length < 3) {
        // console.log("Slug too short:", data.slug);
        toast({
          title: "Invalid slug",
          description: "Slug must be at least 3 characters long",
          variant: "destructive",
        });
        return;
      }
      
      let savedCatalog;
      
      if (isNewCatalog) {
        // console.log("Creating new catalog", data);
        savedCatalog = await createCatalog({
          name: data.name,
          slug: data.slug,
          description: data.description || null,
          is_active: data.is_active
        });
        
        // Update the state and URL
        setCatalogId(savedCatalog.id);
        setIsNewCatalog(false);
        setShareableLink(`${window.location.origin}/c/${savedCatalog.slug}`);
        
        // Update URL without navigation
        window.history.replaceState(null, '', `/catalog/${savedCatalog.id}/edit`);
      } else if (id) {
        // console.log("Updating existing catalog", { id, data });
        savedCatalog = await updateCatalog(id, {
          name: data.name,
          slug: data.slug,
          description: data.description || null,
          is_active: data.is_active
        });
        
        // Update shareable link
        setShareableLink(`${window.location.origin}/c/${savedCatalog.slug}`);
      }
    } catch (error: any) {
      console.error("Error saving catalog:", error);
      toast({
        title: "Error saving catalog",
        description: error.message || "An unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
      setIsLoading(false); // Always clear loading state
    }
  };
  
  const handleOpenProductModal = (product?: Product) => {
    setCurrentProduct(product || undefined);
    setIsProductModalOpen(true);
  };
  
  const handleCloseProductModal = () => {
    setCurrentProduct(undefined);
    setIsProductModalOpen(false);
  };
  
  const handleSaveProduct = async (
    formData: Omit<Product, "id" | "catalog_id" | "created_at" | "updated_at">,
    files?: File[]
  ) => {
    try {
      if (!catalogId || catalogId === "new") {
        throw new Error("Catalog ID is required");
      }
      
      let imageUrl = formData.image_url;
      let imageUrls = formData.image_urls || [];
      
      // Handle image management
      if (files && files.length > 0) {
        // Upload new images
        const newImageUrls = await uploadMultipleProductImages(files);
        
        if (currentProduct?.id) {
          // For existing product, use formData.image_urls as the source of truth
          // for which existing images to keep, then add the newly uploaded ones
          imageUrls = [
            // Only keep existing images that are still in formData.image_urls
            ...(formData.image_urls || []).filter(url => 
              // Make sure it's a valid URL string
              typeof url === 'string' && url.trim() !== "" && 
              // And was previously in the product's image_urls
              (currentProduct.image_urls || []).includes(url)
            ),
            ...newImageUrls
          ];
        } else {
          // For new product, just use the newly uploaded images
          imageUrls = newImageUrls;
        }
      } else if (currentProduct?.id) {
        // If no new files but editing an existing product,
        // use formData.image_urls as the source of truth
        imageUrls = (formData.image_urls || []).filter(url => 
          typeof url === 'string' && url.trim() !== ""
        );
      }
      
      // Set the first image as the main image if there are any images
      if (imageUrls.length > 0) {
        imageUrl = imageUrls[0];
      }
      
      if (currentProduct?.id) {
        // Update existing product
        const updatedProduct = await updateProduct(currentProduct.id, {
          ...formData,
          image_url: imageUrl,
          image_urls: imageUrls,
        });
        
        // Update products array
        setProducts(prevProducts => 
          prevProducts.map(p => p.id === updatedProduct.id ? updatedProduct : p)
        );
      } else {
        // Create new product
        const newProduct = await createProduct({
          ...formData,
          catalog_id: catalogId,
          image_url: imageUrl,
          image_urls: imageUrls,
        });
        
        // Add to products array
        setProducts(prevProducts => [...prevProducts, newProduct]);
      }
    } catch (error: any) {
      toast({
        title: "Error saving product",
        description: error.message,
        variant: "destructive",
      });
      throw error; // Re-throw to inform the form component
    }
  };
  
  const handleDeleteProduct = async (productId: string) => {
    setProductToDelete(productId);
    setIsDeleteDialogOpen(true);
  };
  
  const confirmDelete = async () => {
    if (!productToDelete) return;
    
    try {
      setIsDeleting(true);
      await deleteProduct(productToDelete);
      
      // Remove from products array
      setProducts(prevProducts => prevProducts.filter(p => p.id !== productToDelete));
      
      toast({
        title: "Product deleted",
        description: "Product has been deleted successfully",
      });
      
      setIsDeleteDialogOpen(false);
      setProductToDelete(null);
    } catch (error: any) {
      toast({
        title: "Error deleting product",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };
  
  const copyLinkToClipboard = () => {
    if (shareableLink) {
      navigator.clipboard.writeText(shareableLink);
      toast({
        title: "Link copied",
        description: "Catalog link copied to clipboard",
      });
    }
  };
  
  const previewCatalog = () => {
    if (shareableLink) {
      window.open(shareableLink, '_blank');
    } else {
      toast({
        title: "Save catalog first",
        description: "Please save your catalog before previewing",
      });
    }
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <div className="flex-grow flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-Tonstores-green"></div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col dark:bg-gray-900">
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <CatalogHeader
          isNewCatalog={isNewCatalog}
          catalogName={isNewCatalog ? "Create New Catalog" : "Edit Catalog"}
          shareableLink={shareableLink}
          onSave={(e) => {
            e.preventDefault();
            form.handleSubmit(handleSaveCatalog)();
          }}
          onPreview={previewCatalog}
          onShare={copyLinkToClipboard}
          onDelete={() => setIsDeleteDialogOpen(true)}
          isSaving={isSaving}
        />
        
        <Form {...form}>
          <form onSubmit={(e) => {
            e.preventDefault();
            // Only submit if the save button was clicked
            // This prevents auto-submission when switching tabs
          }}>
            <Tabs 
              value={selectedTab} 
              onValueChange={(value) => {
                // Only set the tab, don't trigger form submission
                setSelectedTab(value);
              }} 
              className="w-full">
              <TabsList className="mb-6 dark:bg-gray-800">
                <TabsTrigger value="details" className="dark:data-[state=active]:bg-gray-700 dark:data-[state=active]:text-white dark:text-gray-300">Catalog Details</TabsTrigger>
                <TabsTrigger value="products" className="dark:data-[state=active]:bg-gray-700 dark:data-[state=active]:text-white dark:text-gray-300">Products</TabsTrigger>
              </TabsList>
              
              <TabsContent value="details">
                <div className="grid grid-cols-1 gap-6">
                  <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm dark:shadow-gray-900 border dark:border-gray-700">
                    <h2 className="text-xl font-semibold mb-4 dark:text-white">Catalog Information</h2>
                    
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="dark:text-gray-300">Catalog Name</FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                placeholder="Enter a name for your catalog"
                                className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                              />
                            </FormControl>
                            <FormMessage className="dark:text-red-400" />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="slug"
                        render={({ field }) => (
                          <FormItem>
                            <div className="flex justify-between">
                              <FormLabel className="dark:text-gray-300">URL Slug</FormLabel>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={generateSlug}
                                disabled={isGeneratingSlug || !form.getValues().name}
                                className="h-6 text-xs dark:text-gray-300 dark:hover:text-white"
                              >
                                {isGeneratingSlug ? 'Generating...' : 'Generate from name'}
                              </Button>
                            </div>
                            <FormControl>
                              <div className="flex items-center">
                                <span className="bg-gray-100 dark:bg-gray-600 px-3 py-2 text-gray-500 dark:text-gray-300 border border-r-0 dark:border-gray-600 rounded-l-md text-sm">
                                  {window.location.origin}/c/
                                </span>
                                <Input 
                                  {...field} 
                                  className="rounded-l-none dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                  placeholder="my-catalog-name"
                                />
                              </div>
                            </FormControl>
                            <FormMessage className="dark:text-red-400" />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="dark:text-gray-300">Catalog Description (Optional)</FormLabel>
                            <FormControl>
                              <Textarea 
                                {...field}
                                placeholder="Describe what your catalog contains"
                                rows={4}
                                value={field.value || ''}
                                className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                              />
                            </FormControl>
                            <FormMessage className="dark:text-red-400" />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="is_active"
                        render={({ field }) => (
                          <FormItem className="flex items-center justify-between">
                            <div>
                              <FormLabel className="dark:text-gray-300">Catalog Status</FormLabel>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                {field.value ? "Your catalog is currently visible to customers" : "Your catalog is currently in draft mode"}
                              </p>
                            </div>
                            <div className="flex items-center space-x-2">
                              <FormLabel className="dark:text-gray-300">
                                {field.value ? "Active" : "Draft"}
                              </FormLabel>
                              <FormControl>
                                <Switch 
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                            </div>
                            <FormMessage className="dark:text-red-400" />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="products">
                <ProductsSection
                  isNewCatalog={isNewCatalog}
                  products={products}
                  isLoading={productsLoading}
                  onAddProduct={() => handleOpenProductModal()}
                  onEditProduct={handleOpenProductModal}
                  onDeleteProduct={handleDeleteProduct}
                />
              </TabsContent>
            </Tabs>
          </form>
        </Form>
      </main>
      
      {/* Product form modal */}
      <ProductForm 
        isOpen={isProductModalOpen}
        onClose={handleCloseProductModal}
        onSubmit={handleSaveProduct}
        initialData={currentProduct}
      />
      
      {/* Delete confirmation dialog */}
      <DeleteConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={confirmDelete}
        isDeleting={isDeleting}
        title="Delete Product"
        description="Are you sure you want to delete this product? This action cannot be undone."
      />
    </div>
  );
};

export default CatalogBuilder;