import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CatalogFormSection from "@/components/catalog/CatalogFormSection";
import ProductsSection from "@/components/catalog/ProductsSection";
import { Product } from "@/hooks/useProducts";

interface CatalogTabsProps {
  isNewCatalog: boolean;
  catalogName: string;
  catalogDescription: string;
  slug: string;
  isActive: boolean;
  shareableLink: string;
  products: Product[];
  productsLoading: boolean;
  isGeneratingSlug: boolean;
  selectedTab: string;
  onTabChange: (value: string) => void;
  onSaveCatalog: (data: any) => void;
  onGenerateSlug: () => void;
  onAddProduct: () => void;
  onEditProduct: (product: Product) => void;
  onDeleteProduct: (productId: string) => void;
}

const CatalogTabs = ({
  isNewCatalog,
  catalogName,
  catalogDescription,
  slug,
  isActive,
  shareableLink,
  products,
  productsLoading,
  isGeneratingSlug,
  selectedTab,
  onTabChange,
  onSaveCatalog,
  onGenerateSlug,
  onAddProduct,
  onEditProduct,
  onDeleteProduct
}: CatalogTabsProps) => {
  return (
    <Tabs value={selectedTab} onValueChange={onTabChange} className="w-full">
      <TabsList className="mb-6 dark:bg-gray-800">
        <TabsTrigger value="details" className="dark:data-[state=active]:bg-gray-700 dark:data-[state=active]:text-white dark:text-gray-300">Catalog Details</TabsTrigger>
        <TabsTrigger value="products" className="dark:data-[state=active]:bg-gray-700 dark:data-[state=active]:text-white dark:text-gray-300">Products</TabsTrigger>
      </TabsList>

      <TabsContent value="details" className="mt-0">
        <div className="grid grid-cols-1 gap-6">
          <CatalogFormSection
            initialData={{
              name: catalogName,
              slug: slug,
              description: catalogDescription || "",
              is_active: isActive
            }}
            onSave={onSaveCatalog}
            isGeneratingSlug={isGeneratingSlug}
            onGenerateSlug={onGenerateSlug}
          />
        </div>
      </TabsContent>

      <TabsContent value="products" className="mt-0">
        <ProductsSection
          isNewCatalog={isNewCatalog}
          products={products}
          isLoading={productsLoading}
          onAddProduct={onAddProduct}
          onEditProduct={onEditProduct}
          onDeleteProduct={onDeleteProduct}
        />
      </TabsContent>
    </Tabs>
  );
};

export default CatalogTabs;