import React, { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Upload, Image } from "lucide-react";
import { useEventTracker } from "@/hooks/useEventTracker";
import { Catalog } from "@/hooks/useCatalog";
import { Product } from "@/hooks/useProducts";

const simpleProductSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  description: z.string().optional(),
  price: z.coerce.number().min(0, "Price cannot be negative"),
  image_url: z.string().nullable().optional(),
});

type SimpleProductFormValues = z.infer<typeof simpleProductSchema>;

type SimpleProductFormProps = {
  catalog: Catalog;
  onSubmit: (data: SimpleProductFormValues, file?: File) => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
};

const SimpleProductForm = ({ catalog, onSubmit, onCancel, isLoading }: SimpleProductFormProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const { trackProductEvent, trackError } = useEventTracker();

  const form = useForm<SimpleProductFormValues>({
    resolver: zodResolver(simpleProductSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      image_url: null,
    }
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        form.setError('image_url', { message: 'Only JPEG, PNG, GIF, and WebP images are supported' });
        return;
      }

      // Validate file size (limit to 10MB)
      if (file.size > 10 * 1024 * 1024) {
        form.setError('image_url', { message: 'Image file size must be less than 10MB' });
        return;
      }

      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      form.setValue("image_url", url);
    }
  };

  const handleSubmit = async (data: SimpleProductFormValues) => {
    try {
      await onSubmit(data, selectedFile || undefined);

      // Track product creation event
      trackProductEvent('product_added_to_cart', 'temp_id', data.name, catalog.id).catch(console.error);
    } catch (error: any) {
      trackError(error, 'SimpleProductForm', 'handleSubmit').catch(console.error);
    }
  };

  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-900 border dark:border-gray-700">
      <h2 className="text-xl font-semibold mb-4 dark:text-white">Add Your First Product</h2>
      <p className="text-gray-600 dark:text-gray-300 mb-6">
        Get started quickly with your first product. You can add more details later!
      </p>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <div className="flex flex-col items-center justify-center">
            <div className="w-full max-w-[200px] aspect-square relative rounded-md overflow-hidden mb-4 border border-gray-200 bg-gray-50 flex items-center justify-center">
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt="Product preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <Image size={64} className="text-gray-300" />
              )}
            </div>

            <label className="cursor-pointer">
              <div className="flex items-center gap-2 bg-Tonstores-blue bg-opacity-10 hover:bg-opacity-20 text-Tonstores-blue px-4 py-2 rounded-md text-sm">
                <Upload size={16} />
                <span>{previewUrl ? "Change Image" : "Upload Product Image"}</span>
              </div>
              <input
                type="file"
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />
            </label>
            <p className="text-xs text-gray-500 mt-2">JPG, PNG, GIF, or WebP (max 10MB)</p>
            <FormMessage>
              {form.formState.errors.image_url?.message}
            </FormMessage>
          </div>

          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Product Name</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Premium T-Shirt" {...field} />
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
                    className="min-h-[80px]"
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

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !form.formState.isValid}
            >
              {isLoading ? "Creating..." : "Create Product"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default SimpleProductForm;