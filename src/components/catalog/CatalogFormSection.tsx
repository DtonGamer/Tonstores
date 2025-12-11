import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { useState, useEffect } from "react";

// Form schema for catalog
const catalogSchema = z.object({
  name: z.string().min(1, "Catalog name is required"),
  slug: z.string().min(3, "Catalog slug must be at least 3 characters")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must contain only lowercase letters, numbers, and hyphens"),
  description: z.string().optional(),
  is_active: z.boolean().default(false)
});

type CatalogFormValues = z.infer<typeof catalogSchema>;

interface CatalogFormSectionProps {
  initialData?: CatalogFormValues;
  onSave: (data: CatalogFormValues) => void;
  isGeneratingSlug: boolean;
  onGenerateSlug: () => void;
}

const CatalogFormSection = ({
  initialData,
  onSave,
  isGeneratingSlug,
  onGenerateSlug
}: CatalogFormSectionProps) => {
  const [isFormDirty, setIsFormDirty] = useState(false);

  const form = useForm<CatalogFormValues>({
    resolver: zodResolver(catalogSchema),
    defaultValues: {
      name: initialData?.name || "",
      slug: initialData?.slug || "",
      description: initialData?.description || "",
      is_active: initialData?.is_active || false
    }
  });

  // Update form values when initialData changes
  useEffect(() => {
    if (initialData) {
      form.reset({
        name: initialData.name || "",
        slug: initialData.slug || "",
        description: initialData.description || "",
        is_active: initialData.is_active || false
      });
    }
  }, [initialData, form]);

  const handleFormSubmit = (data: CatalogFormValues) => {
    onSave(data);
    setIsFormDirty(false);
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm dark:shadow-gray-900 border dark:border-gray-700">
      <h2 className="text-xl font-semibold mb-4 dark:text-white">Catalog Information</h2>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
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
                    onChange={(e) => {
                      field.onChange(e);
                      setIsFormDirty(true);
                    }}
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
                    onClick={onGenerateSlug}
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

          <Button
            type="submit"
            className="bg-tonstores-green hover:bg-tonstores-darkblue"
            disabled={!isFormDirty}
          >
            Save Catalog Details
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default CatalogFormSection;