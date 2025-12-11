import { Button } from "@/components/ui/button";
import { PlusCircle, Trash2 } from "lucide-react";
import ProductCard from "@/components/catalog/ProductCard";
import { Product } from "@/hooks/useProducts";

interface ProductsSectionProps {
  isNewCatalog: boolean;
  products: Product[];
  isLoading: boolean;
  onAddProduct: () => void;
  onEditProduct: (product?: Product) => void;
  onDeleteProduct: (productId: string) => void;
}

const ProductsSection = ({
  isNewCatalog,
  products,
  isLoading,
  onAddProduct,
  onEditProduct,
  onDeleteProduct
}: ProductsSectionProps) => {
  if (isNewCatalog) {
    return (
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border dark:border-gray-700 text-center">
        <h2 className="text-xl font-semibold mb-2 dark:text-white">Save your catalog first</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">You need to save your catalog before adding products.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border dark:border-gray-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold dark:text-white">Products</h2>
          <p className="text-gray-600 dark:text-gray-400">Manage products in your catalog</p>
        </div>
        <Button
          onClick={onAddProduct}
          className="bg-tonstores-green hover:bg-tonstores-darkblue flex items-center gap-2"
        >
          <PlusCircle size={16} />
          Add New Product
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center p-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-tonstores-green"></div>
        </div>
      ) : products.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 p-12 rounded-lg shadow-sm border dark:border-gray-700 text-center">
          <h3 className="text-lg font-semibold mb-2 dark:text-white">No products yet</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">Add your first product to get started</p>
          <Button
            onClick={onAddProduct}
            className="bg-tonstores-green hover:bg-tonstores-darkblue flex items-center gap-2"
          >
            <PlusCircle size={16} />
            Add New Product
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map(product => (
            <div key={product.id} className="relative">
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 z-10 w-8 h-8 rounded-full opacity-80 hover:opacity-100"
                onClick={() => onDeleteProduct(product.id!)}
              >
                <Trash2 size={16} />
              </Button>
              <ProductCard
                id={product.id!}
                name={product.name}
                description={product.description || ""}
                price={product.price}
                imageUrl={product.image_url || "/placeholder.svg"}
                inStock={product.in_stock}
                stockQuantity={product.stock_quantity}
                lowStockThreshold={product.low_stock_threshold}
                isEditable={true}
                onEdit={() => onEditProduct(product)}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductsSection;