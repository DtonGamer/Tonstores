import { useEffect, useState, useMemo, useCallback } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import ProductCard from "@/components/catalog/ProductCard";
import { X, ShoppingCart, ArrowRight, Share2, Mail, Phone, Twitter, Instagram, Facebook, Search, Link2 } from "lucide-react";
import { useCatalog, Catalog } from "@/hooks/useCatalog";
import { useProducts, Product } from "@/hooks/useProducts";
import { useCart } from "@/hooks/useCart";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { getAdminProfile } from "@/hooks/useProfile";
import { refreshSession } from "@/utils/reconnectHandler";
import { Helmet } from "react-helmet";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getStorageUrl } from "@/utils/imageHelpers";

// Default admin contact information as last-resort fallback
const DEFAULT_CONTACTS = {
  email_support: "Creatorrichie@gmail",
  whatsapp_support: "+239038650178",
  twitter_handle: "RichieDbuilder",
  instagram_handle: "tonstores",
  facebook_handle: "Tonstore",
  tiktok_handle: "tonrichie",
};

// TikTok icon component
const TikTokIcon = ({ size = 16, className = "" }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path d="M19.321 5.562a5.124 5.124 0 0 1-1.38 1.015 5.086 5.086 0 0 1-1.616.518V9.39a5.052 5.052 0 0 1-2.299-.56v3.947a5.16 5.16 0 0 1-1.378 3.53 5.2 5.2 0 0 1-7.313.01 5.161 5.161 0 0 1 0-7.313 5.2 5.2 0 0 1 7.313.01c.011.01.02.022.03.032V5.332A9.885 9.885 0 0 0 10.95 4.4a9.9 9.9 0 0 0-5.213 1.495 9.938 9.938 0 0 0-3.595 4.144A9.892 9.892 0 0 0 1.2 14.91a9.958 9.958 0 0 0 2.892 7.024 9.958 9.958 0 0 0 6.817 2.866h.082a9.958 9.958 0 0 0 7.024-2.866 9.958 9.958 0 0 0 2.866-7.024V8.593a9.885 9.885 0 0 0 4.92 1.3V5.783a5.07 5.07 0 0 1-2.766-.768 5.16 5.16 0 0 1-1.815-1.816 5.07 5.07 0 0 1-.769-2.766h-3.109c.002 1.088.287 2.156.829 3.13z" 
    fill="currentColor" />
  </svg>
);

const CatalogView = () => {
  const { slug } = useParams<{ slug: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const [catalog, setCatalog] = useState<Catalog | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [sellerProfile, setSellerProfile] = useState<any>(null);
  const [adminProfile, setAdminProfile] = useState<any>(null);
  
  // Check if we're returning from a cancelled payment
  const paymentCancelled = location.state?.payment_cancelled;
  const cancelledOrderId = location.state?.order_id;
  
  // Store catalog and products in session storage for faster reloads
  const sessionStorageKey = `catalog_${slug}`;
  const productsStorageKey = `products_${slug}`;
  
  const { getCatalogBySlug } = useCatalog();
  const { getProducts } = useProducts();
  
  const catalogId = useMemo(() => catalog?.id || `temp-${slug}`, [catalog?.id, slug]);
  const cart = useCart(catalogId);
  
  const toggleCart = useCallback(() => {
    setIsCartOpen(prevState => !prevState);
  }, []);
  
  const closeCart = useCallback(() => {
    setIsCartOpen(false);
  }, []);

  // Get seller profile with contact information
  const fetchSellerProfile = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();
        
      if (error) {
        // console.error("Error fetching seller profile:", error);
        return null;
      }
      
      return data;
    } catch (error) {
      // console.error("Error fetching seller profile:", error);
      return null;
    }
  }, []);

  // Get contact methods with fallback to defaults
  const getContactMethods = useCallback(() => {
    return {
      email: sellerProfile?.email_support || adminProfile?.email_support || DEFAULT_CONTACTS.email_support,
      whatsapp: sellerProfile?.whatsapp_support || adminProfile?.whatsapp_support || DEFAULT_CONTACTS.whatsapp_support,
      twitter: sellerProfile?.twitter_handle || adminProfile?.twitter_handle || DEFAULT_CONTACTS.twitter_handle,
      instagram: sellerProfile?.instagram_handle || adminProfile?.instagram_handle || DEFAULT_CONTACTS.instagram_handle,
      facebook: sellerProfile?.facebook_handle || adminProfile?.facebook_handle || DEFAULT_CONTACTS.facebook_handle,
      tiktok: sellerProfile?.tiktok_handle || adminProfile?.tiktok_handle || DEFAULT_CONTACTS.tiktok_handle,
    };
  }, [sellerProfile, adminProfile]);
  
  // Fetch admin profile for fallback contact information
  useEffect(() => {
    const fetchAdminProfileData = async () => {
      const adminData = await getAdminProfile();
      if (adminData) {
        setAdminProfile(adminData);
      }
    };
    
    fetchAdminProfileData();
  }, []);

  // Show toast for cancelled payment
  useEffect(() => {
    if (paymentCancelled) {
      toast({
        title: "Payment Cancelled",
        description: "Your payment was cancelled. You can try again when you're ready.",
        variant: "destructive",
      });
      
      // Clear the state to prevent showing the toast again on refresh
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [paymentCancelled]);

  // Add a function to reload catalog and products
  const reloadCatalogAndProducts = useCallback(async () => {
    if (!slug || !catalog?.id) return;
    
    try {
      // Refresh Supabase session first
      await refreshSession();
      
      // Then reload the data
      const catalogData = await getCatalogBySlug(slug);
      if (catalogData) {
        setCatalog(catalogData);
        sessionStorage.setItem(sessionStorageKey, JSON.stringify(catalogData));
        
        const productsData = await getProducts(catalogData.id!);
        if (Array.isArray(productsData)) {
          setProducts(productsData);
          setFilteredProducts(productsData);
          sessionStorage.setItem(productsStorageKey, JSON.stringify(productsData));
        }
      }
    } catch (error) {
      console.error("Error reloading data:", error);
    }
  }, [slug, catalog?.id, getCatalogBySlug, getProducts, sessionStorageKey, productsStorageKey]);

  // Add visibility change listener specific to this component
  useEffect(() => {
    let wasHidden = false;
    let lastVisibleTime = Date.now();
    const VISIBILITY_THRESHOLD = 10 * 60 * 1000; // 10 minutes
    
    const handleVisibilityChange = async () => {
      const isHidden = document.visibilityState === 'hidden';
      
      if (isHidden) {
        wasHidden = true;
        lastVisibleTime = Date.now();
      } else if (wasHidden) {
        // Tab is now visible again after being hidden
        const hiddenDuration = Date.now() - lastVisibleTime;
        
        // If hidden for more than the threshold, reload data
        if (hiddenDuration > VISIBILITY_THRESHOLD) {
          await reloadCatalogAndProducts();
        }
        
        wasHidden = false;
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [reloadCatalogAndProducts]);

  useEffect(() => {
    let isMounted = true;
    
    if (!slug) {
      setIsLoading(false);
      return;
    }
    
    const loadCatalogAndProducts = async () => {
      try {
        setIsLoading(true);
        
        // Try to load from session storage first for faster rendering
        const cachedCatalog = sessionStorage.getItem(sessionStorageKey);
        const cachedProducts = sessionStorage.getItem(productsStorageKey);
        
        // If we have cached data and we're returning from a payment cancellation, use it
        if (cachedCatalog && cachedProducts && paymentCancelled) {
          if (isMounted) {
            const catalogData = JSON.parse(cachedCatalog);
            const productsData = JSON.parse(cachedProducts);
            
            setCatalog(catalogData);
            if (Array.isArray(productsData)) {
              setProducts(productsData);
              setFilteredProducts(productsData);
            }
            
            // Still fetch seller profile if needed
            if (catalogData.user_id && !sellerProfile) {
              const profile = await fetchSellerProfile(catalogData.user_id);
              if (profile && isMounted) {
                setSellerProfile(profile);
              }
            }
            
            setIsLoading(false);
            return;
          }
        }
        
        // If no cached data or not returning from payment, fetch from API
        const catalogData = await getCatalogBySlug(slug);
        
        if (!catalogData || !isMounted) return;
        
        setCatalog(catalogData);
        
        // Cache catalog data in session storage
        sessionStorage.setItem(sessionStorageKey, JSON.stringify(catalogData));
        
        const productsData = await getProducts(catalogData.id!);
        
        if (isMounted) {
          if (Array.isArray(productsData)) {
            setProducts(productsData);
            setFilteredProducts(productsData);
            
            // Cache products data in session storage
            sessionStorage.setItem(productsStorageKey, JSON.stringify(productsData));
          }
          
          // Fetch seller profile for contact information
          if (catalogData.user_id) {
            const profile = await fetchSellerProfile(catalogData.user_id);
            if (profile && isMounted) {
              setSellerProfile(profile);
            }
          }
        }
      } catch (error: any) {
        // console.error("Error loading catalog:", error);
        if (isMounted) {
          toast({
            title: "Error",
            description: "Failed to load catalog. It may not exist or is not active.",
            variant: "destructive",
          });
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };
    
    loadCatalogAndProducts();
    
    return () => {
      isMounted = false;
    };
  }, [slug, fetchSellerProfile, paymentCancelled]);

  // Handle search/filter functionality
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredProducts(products);
      return;
    }

    const lowercasedFilter = searchTerm.toLowerCase();
    const filtered = products.filter(item => {
      const nameMatch = item.name.toLowerCase().includes(lowercasedFilter);
      const descMatch = item.description?.toLowerCase().includes(lowercasedFilter);
      return nameMatch || descMatch;
    });
    
    setFilteredProducts(filtered);
  }, [searchTerm, products]);
  
  const addToCart = (productId: string, quantity: number) => {
    const productToAdd = products.find(p => p.id === productId);
    
    if (productToAdd) {
      cart.addItem({
        id: productToAdd.id!,
        name: productToAdd.name,
        price: productToAdd.price,
        image_url: productToAdd.image_url,
        image_urls: productToAdd.image_urls,
      });
      
      toast({
        title: "Added to cart",
        description: `${quantity} × ${productToAdd.name} added to cart`,
      });
      
      setIsCartOpen(true);
    }
  };
  
  // Share functions for different platforms
  const shareOnWhatsApp = () => {
    const text = `Check out this catalog: ${window.location.href}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, '_blank');
  };
  
  const shareOnTwitter = () => {
    const text = `Check out this amazing catalog: ${catalog?.name}`;
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(window.location.href)}`;
    window.open(twitterUrl, '_blank');
  };
  
  const shareOnFacebook = () => {
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`;
    window.open(facebookUrl, '_blank');
  };
  
  const shareOnTikTok = () => {
    // TikTok doesn't have a direct share API, so we'll copy the link and show instructions
    navigator.clipboard.writeText(window.location.href);
    toast({
      title: "Link copied for TikTok",
      description: "Link copied! Paste it in your TikTok video description or comments.",
    });
  };
  
  const shareOnInstagram = () => {
    // Instagram doesn't have a direct share API, so we'll copy the link and show instructions
    navigator.clipboard.writeText(window.location.href);
    toast({
      title: "Link copied for Instagram",
      description: "Link copied! Paste it in your Instagram bio or story.",
    });
  };
  
  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({
      title: "Link copied",
      description: "Catalog link copied to clipboard",
    });
  };
  
  const proceedToCheckout = () => {
    if (slug) {
      navigate(`/checkout/${slug}`);
    }
  };

  // Helper functions for contact links
  const getWhatsAppLink = (number: string) => {
    const cleanNumber = number.replace(/\s+/g, '');
    return `https://wa.me/${cleanNumber.startsWith('+') ? cleanNumber.substring(1) : cleanNumber}`;
  };

  const getTwitterLink = (handle: string) => {
    if (handle.startsWith('http')) return handle;
    return `https://twitter.com/${handle.startsWith('@') ? handle.substring(1) : handle}`;
  };

  const getInstagramLink = (handle: string) => {
    if (handle.startsWith('http')) return handle;
    return `https://instagram.com/${handle.startsWith('@') ? handle.substring(1) : handle}`;
  };

  const getFacebookLink = (handle: string) => {
    if (handle.startsWith('http')) return handle;
    return `https://facebook.com/${handle}`;
  };
  
  const getTikTokLink = (handle: string) => {
    if (handle.startsWith('http')) return handle;
    return `https://tiktok.com/@${handle.replace(/^@/, '')}`;
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-tonstores-green"></div>
      </div>
    );
  }
  
  if (!catalog) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center p-8">
          <h2 className="text-2xl font-bold mb-2">Catalog Not Found</h2>
          <p className="text-gray-600 mb-6">
            The catalog you're looking for may not exist or is not active.
          </p>
        </div>
      </div>
    );
  }
  
  const contactMethods = getContactMethods();

  return (
    <div className="min-h-screen flex flex-col">
      <Helmet>
        {/* Primary Meta Tags */}
        <title>{catalog?.name || "Product Catalog"} - Shop Online | TonStores Hub</title>
        <meta name="description" content={catalog?.description || `Shop ${catalog?.name || "quality products"} online with secure payment and fast delivery. Buy directly from WhatsApp, Instagram and TikTok.`} />
        <meta name="keywords" content={`${catalog?.name}, online shopping, WhatsApp store, Instagram shop, TikTok shop, ecommerce, Nigeria, ${products.slice(0, 3).map(p => p.name).join(', ')}`} />
        
        {/* Canonical URL */}
        <link rel="canonical" href={window.location.href} />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="TonStores Hub" />
        <meta property="og:title" content={`${catalog?.name || "Shop Online"} - Easy Checkout | TonStores Hub`} />
        <meta property="og:description" content={catalog?.description || `Shop ${catalog?.name || "quality products"} with secure checkout. Fast delivery available. Buy now!`} />
        {products.length > 0 && (
          <meta 
            property="og:image" 
            content={
              (products[0].image_urls && products[0].image_urls.length > 0) 
                ? getStorageUrl(products[0].image_urls[0]) 
                : (products[0].image_url ? getStorageUrl(products[0].image_url) : "/placeholder.svg")
            } 
          />
        )}
        <meta property="og:url" content={window.location.href} />
        <meta property="og:locale" content="en_NG" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@RichieDBuilder" />
        <meta name="twitter:title" content={`${catalog?.name || "Shop Online"} - TonStores Hub`} />
        <meta name="twitter:description" content={catalog?.description || `Shop ${catalog?.name || "quality products"} online with secure payment. Buy directly from social media!`} />
        {products.length > 0 && (
          <meta 
            name="twitter:image" 
            content={
              (products[0].image_urls && products[0].image_urls.length > 0) 
                ? getStorageUrl(products[0].image_urls[0]) 
                : (products[0].image_url ? getStorageUrl(products[0].image_url) : "/placeholder.svg")
            } 
          />
        )}
        
        {/* Additional SEO Tags */}
        <meta name="robots" content="index, follow" />
        <meta name="author" content="TonStores" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="theme-color" content="#4CAF50" />
        
        {/* JSON-LD Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ItemList",
            "itemListElement": products.slice(0, 10).map((product, index) => ({
              "@type": "ListItem",
              "position": index + 1,
              "item": {
                "@type": "Product",
                "name": product.name,
                "description": product.description || `${product.name} - ${catalog?.name}`,
                "image": product.image_url ? getStorageUrl(product.image_url) : "/placeholder.svg",
                "offers": {
                  "@type": "Offer",
                  "price": (product.price / 100).toFixed(2),
                  "priceCurrency": "NGN",
                  "availability": product.in_stock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"
                }
              }
            }))
          })}
        </script>
      </Helmet>
      
      <header className="bg-white dark:bg-gray-900 shadow-lg dark:shadow-gray-950 sticky top-0 z-40 border-b dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-bold text-tonstores-darkblue dark:text-tonstores-blue truncate max-w-xs sm:max-w-md">
              {catalog.name}
            </h1>
            <div className="flex items-center gap-3">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center space-x-1 sm:space-x-2 h-9 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800 hover:bg-tonstores-lightgreen dark:hover:bg-gray-800 transition-colors"
                  >
                    <Share2 size={18} />
                    <span className="hidden sm:inline">Share</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 dark:bg-gray-800 dark:border-gray-700">
                  <DropdownMenuItem onClick={shareOnWhatsApp} className="cursor-pointer py-2 dark:focus:bg-gray-700">
                    <Phone className="mr-2 h-4 w-4 text-green-600" />
                    <span>WhatsApp</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={shareOnTwitter} className="cursor-pointer py-2 dark:focus:bg-gray-700">
                    <Twitter className="mr-2 h-4 w-4 text-blue-500" />
                    <span>Twitter</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={shareOnFacebook} className="cursor-pointer py-2 dark:focus:bg-gray-700">
                    <Facebook className="mr-2 h-4 w-4 text-blue-600" />
                    <span>Facebook</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={shareOnTikTok} className="cursor-pointer py-2 dark:focus:bg-gray-700">
                    <TikTokIcon className="mr-2 h-4 w-4" />
                    <span>TikTok</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={shareOnInstagram} className="cursor-pointer py-2 dark:focus:bg-gray-700">
                    <Instagram className="mr-2 h-4 w-4 text-pink-500" />
                    <span>Instagram</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={copyLink} className="cursor-pointer py-2 dark:focus:bg-gray-700">
                    <Link2 className="mr-2 h-4 w-4" />
                    <span>Copy Link</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Button
                variant="outline"
                size="sm"
                className="flex items-center space-x-1 sm:space-x-2 relative h-9 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800 hover:bg-tonstores-lightgreen dark:hover:bg-gray-800 transition-colors"
                onClick={toggleCart}
              >
                <ShoppingCart size={18} />
                <span className="hidden sm:inline">Cart</span>
                {cart.items.length > 0 && (
                  <Badge className="absolute -top-2 -right-2 bg-tonstores-green text-xs w-5 h-5 flex items-center justify-center">
                    {cart.items.reduce((sum, item) => sum + item.quantity, 0)}
                  </Badge>
                )}
              </Button>
            </div>
          </div>
        </div>
      </header>
      
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold text-tonstores-darkblue dark:text-tonstores-blue mb-2">{catalog.name}</h2>
          {catalog.description && (
            <p className="text-gray-700 dark:text-gray-300 max-w-3xl mx-auto">{catalog.description}</p>
          )}
        </div>

        {/* Search and filter section */}
        <div className="mb-10">
          <div className="relative max-w-lg mx-auto">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="text-gray-400 dark:text-gray-500" size={20} />
            </div>
            <Input
              type="text"
              placeholder="Search products..."
              className="pl-10 pr-10 py-3 text-base rounded-lg border-2 border-gray-200 dark:border-gray-700 focus:border-tonstores-green dark:focus:border-tonstores-green transition-colors"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => setSearchTerm('')}
              >
                <X size={18} className="text-gray-500" />
              </Button>
            )}
          </div>
          {searchTerm && (
            <p className="text-sm text-gray-600 dark:text-gray-400 text-center mt-3">
              Found {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'} matching "{searchTerm}"
            </p>
          )}
        </div>
        
        {filteredProducts.length === 0 ? (
          <div className="text-center p-12">
            <div className="mx-auto w-24 h-24 bg-tonstores-lightgreen rounded-full flex items-center justify-center mb-6">
              <Search className="text-tonstores-green w-12 h-12" />
            </div>
            <h3 className="text-xl font-semibold mb-2 dark:text-white">No Products Found</h3>
            <p className="text-gray-600 dark:text-gray-300 max-w-md mx-auto">
              {products.length === 0
                ? "This catalog currently has no products."
                : "No products match your search criteria."}
            </p>
            {products.length > 0 && searchTerm && (
              <Button
                variant="outline"
                className="mt-6 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                onClick={() => setSearchTerm('')}
              >
                Clear Search
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map(product => (
              <ProductCard
                key={product.id}
                id={product.id!}
                name={product.name}
                description={product.description || ""}
                price={product.price}
                imageUrl={product.image_url ? getStorageUrl(product.image_url) : "/placeholder.svg"}
                imageUrls={product.image_urls ? product.image_urls.map(url => getStorageUrl(url)) : (product.image_url ? [getStorageUrl(product.image_url)] : [])}
                inStock={product.in_stock}
                stockQuantity={product.stock_quantity}
                lowStockThreshold={product.low_stock_threshold}
                onAddToCart={addToCart}
              />
            ))}
          </div>
        )}

        {/* Contact Methods Section */}
        <div className="mt-12 border-t dark:border-gray-700 pt-6">
          <div className="text-center mb-6">
            <h3 className="text-lg sm:text-xl font-semibold mb-2 dark:text-white">Need Support?</h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm max-w-md mx-auto">Our support team is available to assist you with any questions.</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 max-w-4xl mx-auto">
            {/* Email Support */}
            <a
              href={`mailto:${contactMethods.email}`}
              className="flex flex-col items-center p-3 rounded-xl bg-gray-50 dark:bg-gray-800 hover:bg-tonstores-lightgreen dark:hover:bg-gray-700 transition-colors border border-gray-200 dark:border-gray-700"
            >
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mb-2">
                <Mail className="text-blue-600 dark:text-blue-400" size={16} />
              </div>
              <span className="text-xs font-medium dark:text-white">Email</span>
            </a>

            {/* WhatsApp Support */}
            <a
              href={getWhatsAppLink(contactMethods.whatsapp)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center p-3 rounded-xl bg-gray-50 dark:bg-gray-800 hover:bg-tonstores-lightgreen dark:hover:bg-gray-700 transition-colors border border-gray-200 dark:border-gray-700"
            >
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mb-2">
                <Phone className="text-green-600 dark:text-green-400" size={16} />
              </div>
              <span className="text-xs font-medium dark:text-white">WhatsApp</span>
            </a>

            {/* Twitter */}
            <a
              href={getTwitterLink(contactMethods.twitter)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center p-3 rounded-xl bg-gray-50 dark:bg-gray-800 hover:bg-tonstores-lightgreen dark:hover:bg-gray-700 transition-colors border border-gray-200 dark:border-gray-700"
            >
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mb-2">
                <Twitter className="text-blue-500 dark:text-blue-400" size={16} />
              </div>
              <span className="text-xs font-medium dark:text-white">Twitter</span>
            </a>

           {/* Instagram */}
            <a
              href={getInstagramLink(contactMethods.instagram)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center p-3 rounded-xl bg-gray-50 dark:bg-gray-800 hover:bg-tonstores-lightgreen dark:hover:bg-gray-700 transition-colors border border-gray-200 dark:border-gray-700"
            >
              <div className="w-10 h-10 bg-pink-100 dark:bg-pink-900 rounded-full flex items-center justify-center mb-2">
                <Instagram className="text-pink-500 dark:text-pink-400" size={16} />
              </div>
              <span className="text-xs font-medium dark:text-white">Instagram</span>
            </a>

            {/* Facebook */}
            <a
              href={getFacebookLink(contactMethods.facebook)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center p-3 rounded-xl bg-gray-50 dark:bg-gray-800 hover:bg-tonstores-lightgreen dark:hover:bg-gray-700 transition-colors border border-gray-200 dark:border-gray-700"
            >
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mb-2">
                <Facebook className="text-blue-600 dark:text-blue-400" size={16} />
              </div>
              <span className="text-xs font-medium dark:text-white">Facebook</span>
            </a>

            {/* TikTok */}
            <a
              href={getTikTokLink(contactMethods.tiktok)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center p-3 rounded-xl bg-gray-50 dark:bg-gray-800 hover:bg-tonstores-lightgreen dark:hover:bg-gray-700 transition-colors border border-gray-200 dark:border-gray-700"
            >
              <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-2">
                <TikTokIcon className="text-gray-800 dark:text-gray-200" size={16} />
              </div>
              <span className="text-xs font-medium dark:text-white">TikTok</span>
            </a>
          </div>
        </div>
      </main>
      
      {/* Cart Sidebar */}
      {isCartOpen && (
        <>
          <div
            className="fixed inset-0 bg-black bg-opacity-40 z-40 transition-opacity"
            onClick={closeCart}
          ></div>
          <div
            className="fixed inset-y-0 right-0 max-w-sm w-full bg-white shadow-xl transform z-50 transition-transform duration-300 ease-in-out"
          >
            <div className="h-full flex flex-col p-5">
              <div className="flex justify-between items-center mb-4 pb-2 border-b">
                <h2 className="text-lg font-bold">Your Cart ({cart.items.length})</h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={closeCart}
                  className="rounded-full hover:bg-gray-100"
                >
                  <X size={20} />
                </Button>
              </div>

              {cart.isEmpty ? (
                <div className="flex-grow flex flex-col items-center justify-center text-center py-8">
                  <div className="bg-tonstores-lightgreen p-4 rounded-full mb-4">
                    <ShoppingCart size={40} className="text-tonstores-green mx-auto" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Your cart is empty</h3>
                  <p className="text-gray-600 mb-6">
                    Start adding some products to your cart
                  </p>
                  <Button
                    variant="outline"
                    className="border-tonstores-green text-tonstores-green hover:bg-tonstores-lightgreen"
                    onClick={closeCart}
                  >
                    Continue Shopping
                  </Button>
                </div>
              ) : (
                <>
                  <div className="flex-grow overflow-y-auto space-y-4 py-2">
                    {cart.items.map(item => (
                      <div key={item.id} className="flex items-center py-3 border-b border-gray-100 dark:border-gray-700">
                        <img
                          src={item.image_urls?.[0] ? getStorageUrl(item.image_urls[0]) : (item.image_url ? getStorageUrl(item.image_url) : "/placeholder.svg")}
                          alt={item.name}
                          className="w-16 h-16 object-cover rounded-lg mr-3"
                        />
                        <div className="flex-grow min-w-0">
                          <h4 className="font-medium text-sm truncate">{item.name}</h4>
                          <div className="flex items-center justify-between mt-1">
                            <div className="flex items-center border rounded">
                              <button
                                className="p-1 text-gray-600 hover:bg-gray-100"
                                onClick={() => cart.updateQuantity(item.id, item.quantity - 1)}
                                type="button"
                                disabled={item.quantity <= 1}
                              >
                                -
                              </button>
                              <span className="px-2 py-1 min-w-[40px] text-center">{item.quantity}</span>
                              <button
                                className="p-1 text-gray-600 hover:bg-gray-100"
                                onClick={() => cart.updateQuantity(item.id, item.quantity + 1)}
                                type="button"
                              >
                                +
                              </button>
                            </div>
                            <span className="font-medium text-sm">
                              ₦{((item.price * item.quantity) / 100).toLocaleString()}
                            </span>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="ml-1 p-0 w-8 h-8 rounded-full hover:bg-gray-100"
                          onClick={() => cart.removeItem(item.id)}
                        >
                          <X size={16} />
                        </Button>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-gray-200 pt-4 mt-auto">
                    <div className="flex justify-between text-base font-semibold mb-2">
                      <span>Total:</span>
                      <span>₦{(cart.total / 100).toLocaleString()}</span>
                    </div>

                    <Button
                      className="w-full bg-tonstores-green hover:bg-tonstores-darkgreen py-2.5 flex items-center justify-center"
                      onClick={proceedToCheckout}
                    >
                      Proceed to Checkout
                      <ArrowRight className="ml-2" size={18} />
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default CatalogView;
