import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import ProductCard from "@/components/catalog/ProductCard";
import { X, ShoppingCart, Share2, Phone, Twitter, Instagram, Facebook, Search, Link2 } from "lucide-react";
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
import ContactMethods from "@/components/catalog/ContactMethods";
import CartSidebar from "@/components/catalog/CartSidebar";
import TikTokIcon from "@/components/catalog/tiktokIcon";

const DEFAULT_CONTACTS = {
  email_support: "Creatorrichie@gmail",
  whatsapp_support: "+239038650178",
  twitter_handle: "RichieDbuilder",
  instagram_handle: "Tonstores",
  facebook_handle: "Tonstore",
  tiktok_handle: "tonrichie",
};

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

  const paymentCancelled = location.state?.payment_cancelled;
  const sessionStorageKey = `catalog_${slug}`;
  const productsStorageKey = `products_${slug}`;

  const { getCatalogBySlug } = useCatalog();
  const { getProducts } = useProducts(catalog?.id);

  const catalogId = useMemo(() => catalog?.id || `temp-${slug}`, [catalog?.id, slug]);
  const cart = useCart(catalogId);

  // Use ref to track if initial load is complete
  const hasLoadedInitially = useRef(false);
  
  const toggleCart = useCallback(() => {
    setIsCartOpen(prev => !prev);
  }, []);
  
  const closeCart = useCallback(() => {
    setIsCartOpen(false);
  }, []);

  const fetchSellerProfile = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();
        
      if (error) return null;
      return data;
    } catch (error) {
      return null;
    }
  }, []);

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
  
  // Fetch admin profile once
  useEffect(() => {
    const fetchAdminProfileData = async () => {
      const adminData = await getAdminProfile();
      if (adminData) {
        setAdminProfile(adminData);
      }
    };

    fetchAdminProfileData();
  }, []);

  // Show toast for cancelled payment once
  useEffect(() => {
    if (paymentCancelled) {
      toast({
        title: "Payment Cancelled",
        description: "Your payment was cancelled. You can try again when you're ready.",
        variant: "destructive",
      });
      
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [paymentCancelled]);

  // Main data loading effect
  useEffect(() => {
    let isMounted = true;

    if (!slug) {
      setIsLoading(false);
      return;
    }

    const loadCatalogAndProducts = async () => {
      // Skip if already loaded
      if (hasLoadedInitially.current && !paymentCancelled) {
        return;
      }

      try {
        setIsLoading(true);

        // Try cache first for payment cancellation returns
        const cachedCatalog = sessionStorage.getItem(sessionStorageKey);
        const cachedProducts = sessionStorage.getItem(productsStorageKey);

        if (cachedCatalog && cachedProducts && paymentCancelled) {
          if (isMounted) {
            const catalogData = JSON.parse(cachedCatalog);
            const productsData = JSON.parse(cachedProducts);

            setCatalog(catalogData);
            if (Array.isArray(productsData)) {
              setProducts(productsData);
              setFilteredProducts(productsData);
            }

            if (catalogData.user_id && !sellerProfile) {
              const profile = await fetchSellerProfile(catalogData.user_id);
              if (profile && isMounted) {
                setSellerProfile(profile);
              }
            }

            setIsLoading(false);
            hasLoadedInitially.current = true;
            return;
          }
        }

        // Fetch fresh data
        const catalogData = await getCatalogBySlug(slug);

        if (!catalogData || !isMounted) return;

        setCatalog(catalogData);
        sessionStorage.setItem(sessionStorageKey, JSON.stringify(catalogData));

        const productsData = await getProducts(catalogData.id!);

        if (isMounted) {
          if (Array.isArray(productsData)) {
            setProducts(productsData);
            setFilteredProducts(productsData);
            sessionStorage.setItem(productsStorageKey, JSON.stringify(productsData));
          }

          if (catalogData.user_id) {
            const profile = await fetchSellerProfile(catalogData.user_id);
            if (profile && isMounted) {
              setSellerProfile(profile);
            }
          }
          
          hasLoadedInitially.current = true;
        }
      } catch (error: any) {
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
  }, [slug, paymentCancelled]); // Minimal dependencies

  // Visibility change handler - only reload after long absence
  useEffect(() => {
    if (!hasLoadedInitially.current) return;

    let wasHidden = false;
    let lastVisibleTime = Date.now();
    const VISIBILITY_THRESHOLD = 10 * 60 * 1000; // 10 minutes

    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'hidden') {
        wasHidden = true;
        lastVisibleTime = Date.now();
      } else if (wasHidden) {
        const hiddenDuration = Date.now() - lastVisibleTime;

        if (hiddenDuration > VISIBILITY_THRESHOLD && slug && catalog?.id) {
          try {
            await refreshSession();
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
        }

        wasHidden = false;
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [slug, catalog?.id]); // Stable dependencies

  // Handle search
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
  
  const shareOnWhatsApp = () => {
    const text = `Check out this catalog: ${window.location.href}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };
  
  const shareOnTwitter = () => {
    const text = `Check out this amazing catalog: ${catalog?.name}`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(window.location.href)}`, '_blank');
  };
  
  const shareOnFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`, '_blank');
  };
  
  const shareOnTikTok = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({
      title: "Link copied for TikTok",
      description: "Link copied! Paste it in your TikTok video description or comments.",
    });
  };
  
  const shareOnInstagram = () => {
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-Tonstores-green"></div>
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
        <title>{catalog?.name || "Product Catalog"} - Shop Online | Tonstores Hub</title>
        <meta name="description" content={catalog?.description || `Shop ${catalog?.name || "quality products"} online with secure payment and fast delivery.`} />
        <link rel="canonical" href={window.location.href} />
        <meta property="og:type" content="website" />
        <meta property="og:title" content={`${catalog?.name || "Shop Online"} - Tonstores Hub`} />
        <meta property="og:url" content={window.location.href} />
      </Helmet>
      
      <header className="bg-white dark:bg-gray-900 shadow-lg sticky top-0 z-40 border-b dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-Tonstores-green to-Tonstores-darkblue bg-clip-text text-transparent truncate max-w-xs sm:max-w-md">
              {catalog.name}
            </h1>
            <div className="flex items-center gap-3">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="flex items-center space-x-1 sm:space-x-2 h-9">
                    <Share2 size={18} />
                    <span className="hidden sm:inline">Share</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={shareOnWhatsApp} className="cursor-pointer py-2">
                    <Phone className="mr-2 h-4 w-4 text-green-600" />
                    <span>WhatsApp</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={shareOnTwitter} className="cursor-pointer py-2">
                    <Twitter className="mr-2 h-4 w-4 text-blue-500" />
                    <span>Twitter</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={shareOnFacebook} className="cursor-pointer py-2">
                    <Facebook className="mr-2 h-4 w-4 text-blue-600" />
                    <span>Facebook</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={shareOnTikTok} className="cursor-pointer py-2">
                    <TikTokIcon className="mr-2 h-4 w-4" />
                    <span>TikTok</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={shareOnInstagram} className="cursor-pointer py-2">
                    <Instagram className="mr-2 h-4 w-4 text-pink-500" />
                    <span>Instagram</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={copyLink} className="cursor-pointer py-2">
                    <Link2 className="mr-2 h-4 w-4" />
                    <span>Copy Link</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Button variant="outline" size="sm" className="flex items-center space-x-1 sm:space-x-2 relative h-9" onClick={toggleCart}>
                <ShoppingCart size={18} />
                <span className="hidden sm:inline">Cart</span>
                {cart.items.length > 0 && (
                  <Badge className="absolute -top-2 -right-2 bg-Tonstores-green text-xs w-5 h-5 flex items-center justify-center">
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
          <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-Tonstores-green to-Tonstores-darkblue bg-clip-text text-transparent mb-2">
            {catalog.name}
          </h2>
          {catalog.description && (
            <p className="text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">{catalog.description}</p>
          )}
        </div>

        <div className="mb-10">
          <div className="relative max-w-lg mx-auto">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="text-gray-400" size={20} />
            </div>
            <Input
              type="text"
              placeholder="Search products..."
              className="pl-10 pr-10 py-3"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8"
                onClick={() => setSearchTerm('')}
              >
                <X size={18} />
              </Button>
            )}
          </div>
          {searchTerm && (
            <p className="text-sm text-gray-600 text-center mt-3">
              Found {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'}
            </p>
          )}
        </div>
        
        {filteredProducts.length === 0 ? (
          <div className="text-center p-12">
            <h3 className="text-xl font-semibold mb-2">No Products Found</h3>
            <p className="text-gray-600">
              {products.length === 0 ? "This catalog currently has no products." : "No products match your search."}
            </p>
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
                imageUrls={product.image_urls ? product.image_urls.map(url => getStorageUrl(url)) : []}
                inStock={product.in_stock}
                stockQuantity={product.stock_quantity}
                lowStockThreshold={product.low_stock_threshold}
                onAddToCart={addToCart}
              />
            ))}
          </div>
        )}

        <ContactMethods
          contactMethods={contactMethods}
          getWhatsAppLink={getWhatsAppLink}
          getTwitterLink={getTwitterLink}
          getInstagramLink={getInstagramLink}
          getFacebookLink={getFacebookLink}
          getTikTokLink={getTikTokLink}
        />
      </main>
      
      <CartSidebar
        isOpen={isCartOpen}
        onClose={closeCart}
        cart={cart}
        onProceedToCheckout={proceedToCheckout}
      />
    </div>
  );
};

export default CatalogView;