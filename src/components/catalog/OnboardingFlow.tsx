import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Copy, Link as LinkIcon, CheckCircle } from "lucide-react";
import { useCatalog, Catalog } from "@/hooks/useCatalog";
import { useProducts, Product } from "@/hooks/useProducts";
import useAuth from "@/contexts/AuthContext";
import { toast } from "@/components/ui/use-toast";
import SimpleProductForm from "@/components/catalog/SimpleProductForm";
import { useEventTracker } from "@/hooks/useEventTracker";
import { safeTrackEvent } from "@/utils/eventTracker";

// Form schema for catalog
const catalogSchema = z.object({
  name: z.string().min(1, "Catalog name is required"),
  slug: z.string().min(3, "Catalog slug must be at least 3 characters")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must contain only lowercase letters, numbers, and hyphens"),
  description: z.string().optional(),
  is_active: z.boolean().default(true)
});

type CatalogFormValues = z.infer<typeof catalogSchema>;

const OnboardingFlow = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { createCatalog, generateUniqueSlug } = useCatalog();
  const { createProduct, uploadProductImage } = useProducts();
  const { trackEvent: trackEventHook } = useEventTracker();
  const [currentStep, setCurrentStep] = useState<"catalog" | "product" | "complete">("catalog");
  const [catalog, setCatalog] = useState<Catalog | null>(null);
  const [product, setProduct] = useState<Product | null>(null);
  const [shareableLink, setShareableLink] = useState<string>("");
  const [isGeneratingSlug, setIsGeneratingSlug] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Track onboarding started
  useEffect(() => {
    safeTrackEvent('onboarding_started');
  }, []);

  const catalogForm = useForm<CatalogFormValues>({
    resolver: zodResolver(catalogSchema),
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      is_active: true
    }
  });

  // Generate slug when name changes
  useEffect(() => {
    const subscription = catalogForm.watch((value, { name }) => {
      if (name === 'name' && value.name && !catalogForm.getValues('slug')) {
        generateSlug(value.name);
      }
    });
    return () => subscription.unsubscribe();
  }, [catalogForm]);

  const generateSlug = async (name: string) => {
    if (!name || name.length < 3) return;

    setIsGeneratingSlug(true);
    try {
      let newSlug = name
        .toLowerCase()
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .trim();

      // ensure length >= 3
      if (newSlug.length < 3) {
        newSlug = newSlug.padEnd(3, newSlug[0] || "a");
      }

      // Check uniqueness using the hook
      const uniqueSlug = await generateUniqueSlug(name);
      catalogForm.setValue("slug", uniqueSlug);
    } catch (error) {
      toast({
        title: "Error generating slug",
        description: "Please try again or enter a slug manually.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingSlug(false);
    }
  };

  const handleCreateCatalog = async (data: CatalogFormValues) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to create a catalog",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const newCatalog = await createCatalog({
        name: data.name,
        slug: data.slug,
        description: data.description || null,
        is_active: data.is_active
      });

      setCatalog(newCatalog);
      setShareableLink(`${window.location.origin}/c/${newCatalog.slug}`);
      setCurrentStep("product");

      // Track catalog creation event
      safeTrackEvent('catalog_created', { catalog_id: newCatalog.id });

      // Track that user completed step 1 (create catalog)
      safeTrackEvent('onboarding_step_completed', {
        step: 'create_catalog',
        catalog_id: newCatalog.id
      });
    } catch (error: any) {
      toast({
        title: "Error creating catalog",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateProduct = async (productData: any, file?: File) => {
    if (!catalog) {
      toast({
        title: "Error",
        description: "Catalog is not created yet",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Upload image if provided
      let imageUrl = null;
      if (file) {
        imageUrl = await uploadProductImage(file);
      }

      const newProduct = await createProduct({
        ...productData,
        catalog_id: catalog.id,
        image_url: imageUrl,
        image_urls: imageUrl ? [imageUrl] : [],
        // Convert price from naira to kobo for storage
        price: Math.round(productData.price * 100),
      });

      setProduct(newProduct);
      setCurrentStep("complete");

      // Track product creation event
      safeTrackEvent('product_created', {
        product_id: newProduct.id,
        catalog_id: catalog.id
      });

      // Track first product creation for metric
      safeTrackEvent('first_product_created', {
        catalog_id: catalog.id,
        product_id: newProduct.id
      });

      // Track that user completed step 2 (create product)
      safeTrackEvent('onboarding_step_completed', {
        step: 'create_product',
        catalog_id: catalog.id,
        product_id: newProduct.id
      });
    } catch (error: any) {
      toast({
        title: "Error creating product",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyLinkToClipboard = () => {
    if (shareableLink) {
      navigator.clipboard.writeText(shareableLink);
      toast({
        title: "Link copied",
        description: "Catalog link copied to clipboard",
      });

      // Track share event
      safeTrackEvent('catalog_shared', {
        catalog_id: catalog?.id,
        share_method: 'copy_link'
      });

      // Track that user completed step 3 (share catalog)
      safeTrackEvent('onboarding_step_completed', {
        step: 'share_catalog',
        catalog_id: catalog?.id
      });

      // Track that user completed the full onboarding
      safeTrackEvent('onboarding_completed', {
        catalog_id: catalog?.id,
        product_id: product?.id
      });
    }
  };

  const goToCatalogBuilder = () => {
    if (catalog) {
      navigate(`/catalog/${catalog.id}/edit`);
    }
  };

  return (
    <div className="min-h-screen bg-Tonstores-lightgray flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Create Your First Catalog</CardTitle>
            <CardDescription>
              {currentStep === "catalog" && "Set up your catalog in seconds"}
              {currentStep === "product" && "Add your first product"}
              {currentStep === "complete" && "You're all set!"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Progress indicator */}
            <div className="flex items-center justify-between mb-8">
              <div className={`flex flex-col items-center ${currentStep === "catalog" ? "text-Tonstores-green" : "text-gray-400"}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 ${
                  currentStep === "catalog" ? "bg-Tonstores-green text-white" :
                  currentStep === "product" || currentStep === "complete" ? "bg-green-500 text-white" : "bg-gray-200"
                }`}>
                  {currentStep === "catalog" ? 1 : <CheckCircle size={16} />}
                </div>
                <span className="text-sm">Catalog</span>
              </div>
              
              <div className={`flex-1 h-0.5 ${currentStep !== "catalog" ? "bg-Tonstores-green" : "bg-gray-200"}`}></div>
              
              <div className={`flex flex-col items-center ${currentStep === "product" ? "text-Tonstores-green" : "text-gray-400"}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 ${
                  currentStep === "product" ? "bg-Tonstores-green text-white" : 
                  currentStep === "complete" ? "bg-green-500 text-white" : "bg-gray-200"
                }`}>
                  {currentStep === "complete" ? <CheckCircle size={16} /> : 2}
                </div>
                <span className="text-sm">Product</span>
              </div>
              
              <div className={`flex-1 h-0.5 ${currentStep === "complete" ? "bg-Tonstores-green" : "bg-gray-200"}`}></div>
              
              <div className={`flex flex-col items-center ${currentStep === "complete" ? "text-Tonstores-green" : "text-gray-400"}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 ${
                  currentStep === "complete" ? "bg-green-500 text-white" : "bg-gray-200"
                }`}>
                  3
                </div>
                <span className="text-sm">Share</span>
              </div>
            </div>

            {currentStep === "catalog" && (
              <Form {...catalogForm}>
                <form onSubmit={catalogForm.handleSubmit(handleCreateCatalog)} className="space-y-6">
                  <FormField
                    control={catalogForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Catalog Name</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="e.g., My Online Store"
                            className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            disabled={isSubmitting}
                          />
                        </FormControl>
                        <FormMessage className="dark:text-red-400" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={catalogForm.control}
                    name="slug"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex justify-between">
                          <FormLabel className="dark:text-gray-300">URL Slug</FormLabel>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => generateSlug(catalogForm.getValues().name)}
                            disabled={isGeneratingSlug || !catalogForm.getValues().name}
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
                              placeholder="my-store-name"
                              disabled={isSubmitting}
                            />
                          </div>
                        </FormControl>
                        <FormMessage className="dark:text-red-400" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={catalogForm.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="dark:text-gray-300">Catalog Description (Optional)</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            placeholder="Describe what your catalog contains"
                            rows={3}
                            value={field.value || ''}
                            className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            disabled={isSubmitting}
                          />
                        </FormControl>
                        <FormMessage className="dark:text-red-400" />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => navigate('/dashboard')}
                      disabled={isSubmitting}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={isSubmitting || !catalogForm.formState.isValid}
                    >
                      {isSubmitting ? "Creating..." : "Create Catalog"}
                    </Button>
                  </div>
                </form>
              </Form>
            )}

            {currentStep === "product" && catalog && (
              <SimpleProductForm
                catalog={catalog}
                onSubmit={handleCreateProduct}
                onCancel={() => setCurrentStep("catalog")}
                isLoading={isSubmitting}
              />
            )}

            {currentStep === "complete" && catalog && product && (
              <div className="text-center py-6">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-8 h-8 text-green-500" />
                  </div>
                </div>
                
                <h3 className="text-xl font-semibold mb-2">Your Catalog is Ready!</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  You've successfully created your first catalog with one product. 
                  Share your link to start selling!
                </p>
                
                <div className="flex flex-col items-center mb-6">
                  <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg px-4 py-3 mb-4 w-full max-w-md">
                    <LinkIcon className="text-gray-500 mr-2 flex-shrink-0" />
                    <span className="truncate text-sm text-gray-700 dark:text-gray-300">
                      {shareableLink}
                    </span>
                  </div>
                  
                  <Button onClick={copyLinkToClipboard} className="w-full max-w-xs">
                    <Copy className="w-4 h-4 mr-2" />
                    Copy Link
                  </Button>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button
                    onClick={() => {
                      window.open(shareableLink, '_blank');
                      // Track preview event as a type of sharing
                      safeTrackEvent('catalog_shared', {
                        catalog_id: catalog?.id,
                        share_method: 'preview'
                      });
                    }}
                    variant="outline"
                    className="w-full sm:w-auto"
                  >
                    Preview Catalog
                  </Button>
                  <Button
                    onClick={goToCatalogBuilder}
                    className="w-full sm:w-auto"
                  >
                    Add More Products
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OnboardingFlow;