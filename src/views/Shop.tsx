'use client';
import { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '@/api/client';
import PageTransition from '@/components/PageTransition';
import SectionHeading from '@/components/SectionHeading';
import ProductCard from '@/components/shop/ProductCard';
import ProductDetailDrawer from '@/components/shop/ProductDetailDrawer';
import { ProductItem } from '@/types';
import { fadeUp, stagger, viewportOnce, EASE } from '@/lib/motion';
import { cn } from '@/lib/utils';
import { AlertCircle, RefreshCw, ShoppingBag } from 'lucide-react';
import { useCart } from '@/lib/CartContext';

const CATEGORIES = [
  'All',
  'Apparel',
  'Supplements',
  'Equipment',
  'Accessories',
  'Wellness Tech',
] as const;

export default function Shop() {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<ProductItem | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { totalItems, setCartOpen } = useCart();

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.entities.Products.list();
      setProducts(data || []);
    } catch {
      setError('Unable to load our current inventory catalog.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    if (activeCategory === 'All') return products;
    return products.filter((p) => p.category === activeCategory);
  }, [products, activeCategory]);

  const handleOpenDetail = (p: ProductItem) => {
    setSelectedProduct(p);
    setDrawerOpen(true);
  };

  return (
    <PageTransition>
      {/* Header section */}
      <section className="px-6 md:px-12 pt-36 md:pt-44 pb-12 text-center max-w-5xl 3xl:max-w-6xl mx-auto">
        <SectionHeading
          label="The Pro Shop"
          title="Apparel, gear, and fuel."
          intro="Curated athletic apparel, laboratory-tested nutritional formulas, and studio-grade training equipment calibrated for high-performance routines."
          align="center"
          className="mx-auto"
        />

        {/* Category Filter Tabs */}
        <div className="mt-10 flex items-center justify-center">
          <div className="flex gap-2 overflow-x-auto no-scrollbar max-w-full pb-2 px-2 snap-x-mandatory">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={cn(
                  'min-h-[44px] px-5 py-2 text-xs uppercase tracking-ultra transition-all select-none whitespace-nowrap shrink-0 snap-center border',
                  activeCategory === cat
                    ? 'border-primary bg-primary text-primary-foreground font-semibold shadow-sm'
                    : 'border-border/60 bg-card/60 text-foreground/70 hover:text-foreground hover:border-border'
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Product Catalog Grid */}
      <section className="px-6 md:px-12 pb-32 max-w-7xl 3xl:max-w-[1700px] 4k:max-w-[2200px] mx-auto min-h-[500px] content-visibility-auto">
        {error ? (
          <div className="p-8 border border-border/60 text-center max-w-lg mx-auto my-12 bg-card">
            <AlertCircle className="w-8 h-8 text-primary mx-auto mb-4" />
            <p className="text-foreground font-heading text-xl">Catalog Unavailable</p>
            <p className="mt-2 text-foreground/60 text-sm">{error}</p>
            <button
              onClick={fetchProducts}
              className="mt-6 inline-flex items-center gap-2 min-h-[44px] px-6 py-2.5 border border-border text-[0.7rem] uppercase tracking-label text-foreground hover:border-primary hover:text-primary transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Try again
            </button>
          </div>
        ) : loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="border border-border/60 bg-card/40 space-y-4 animate-pulse p-4">
                <div className="aspect-[3/4] w-full bg-muted/60" />
                <div className="h-4 w-20 bg-muted" />
                <div className="h-6 w-3/4 bg-muted" />
                <div className="h-4 w-1/3 bg-muted" />
              </div>
            ))}
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-6 pb-3 border-b border-border/50">
              <span>Showing {filteredProducts.length} items</span>
              <button
                onClick={() => setCartOpen(true)}
                className="inline-flex items-center gap-1.5 text-primary hover:underline uppercase tracking-wider text-[0.7rem] font-medium"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>View Bag ({totalItems})</span>
              </button>
            </div>

            <motion.div
              key={activeCategory}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: EASE }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
              {filteredProducts.map((prod) => (
                <ProductCard
                  key={prod.id}
                  product={prod}
                  onOpenDetail={handleOpenDetail}
                />
              ))}
            </motion.div>
          </div>
        )}
      </section>

      {/* Product Detail Drawer */}
      <ProductDetailDrawer
        product={selectedProduct}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />
    </PageTransition>
  );
}

