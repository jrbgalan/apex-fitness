'use client';
import { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { X, Star, Plus, Minus, Check, ShoppingBag, ShieldCheck, Ban } from 'lucide-react';
import { ProductItem } from '@/types';
import { useCart } from '@/lib/CartContext';
import { INITIAL_PRODUCTS } from '@/data/mockData';
import { EASE } from '@/lib/motion';

interface ProductDetailDrawerProps {
  product: ProductItem | null;
  open: boolean;
  onClose: () => void;
  onSelectProduct?: (p: ProductItem) => void;
}

export default function ProductDetailDrawer({
  product,
  open,
  onClose,
  onSelectProduct,
}: ProductDetailDrawerProps) {
  const { addToCart, setCartOpen } = useCart();
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedFlavor, setSelectedFlavor] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (product) {
      setSelectedImage(product.image);
      setSelectedSize(product.sizes?.[0] || '');
      setSelectedFlavor(product.flavors?.[0] || '');
      setQuantity(1);
      setIsAdded(false);
    }
  }, [product]);

  useEffect(() => {
    if (!open) return;
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = originalStyle;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, onClose]);

  const relatedProducts = useMemo(() => {
    if (!product) return [];
    return INITIAL_PRODUCTS.filter(
      (p) => p.id !== product.id && (p.category === product.category || p.stock > 0)
    ).slice(0, 3);
  }, [product]);

  if (!product) return null;

  const isSoldOut = product.stock <= 0;

  const galleryImages = [
    product.image,
    ...(product.hover_image ? [product.hover_image] : []),
    ...(product.gallery || []),
  ].filter((src, idx, arr) => arr.indexOf(src) === idx);

  const handleAddToCart = () => {
    if (isSoldOut) return;
    addToCart(
      product,
      quantity,
      selectedSize || undefined,
      selectedFlavor || undefined
    );
    setIsAdded(true);
    setTimeout(() => {
      setIsAdded(false);
      onClose();
      setCartOpen(true);
    }, 600);
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[75] overflow-hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={onClose}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm"
          />

          {/* Slide-in Drawer */}
          <div className="fixed inset-y-0 right-0 flex max-w-full pl-6">
            <motion.div
              ref={drawerRef}
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.45, ease: EASE }}
              role="dialog"
              aria-modal="true"
              aria-labelledby="product-drawer-title"
              className="w-screen max-w-lg bg-card border-l border-border/80 shadow-2xl flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-border/60">
                <span className="text-[0.68rem] uppercase tracking-ultra text-primary font-mono">
                  {product.category}
                </span>
                <button
                  onClick={onClose}
                  aria-label="Close product view"
                  className="p-2 -mr-2 text-foreground/70 hover:text-foreground hover:bg-secondary/50 rounded-full transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Scrollable Body */}
              <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
                {/* Image Gallery */}
                <div className="space-y-3">
                  <div className="relative aspect-[4/3] w-full bg-secondary/40 overflow-hidden border border-border/60">
                    <Image
                      src={selectedImage || product.image}
                      alt={product.name}
                      fill
                      sizes="500px"
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-background/15 pointer-events-none" />
                    {isSoldOut ? (
                      <span className="absolute top-3 left-3 bg-destructive text-destructive-foreground text-[0.62rem] uppercase tracking-wider font-semibold px-2.5 py-1">
                        Sold Out
                      </span>
                    ) : (
                      product.badge && (
                        <span className="absolute top-3 left-3 bg-primary text-primary-foreground text-[0.62rem] uppercase tracking-wider font-semibold px-2.5 py-1">
                          {product.badge}
                        </span>
                      )
                    )}
                  </div>

                  {/* Thumbnail Row */}
                  {galleryImages.length > 1 && (
                    <div className="flex gap-2.5 overflow-x-auto pb-1">
                      {galleryImages.map((img, i) => (
                        <button
                          key={i}
                          onClick={() => setSelectedImage(img)}
                          aria-label={`View photo ${i + 1}`}
                          className={`relative w-16 h-16 shrink-0 border overflow-hidden transition-all ${
                            selectedImage === img
                              ? 'border-primary ring-1 ring-primary'
                              : 'border-border/60 opacity-60 hover:opacity-100'
                          }`}
                        >
                          <Image src={img} alt="" fill sizes="64px" className="object-cover" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Title & Rating */}
                <div>
                  <div className="flex items-center justify-between gap-4">
                    <h2 id="product-drawer-title" className="font-heading text-2xl text-foreground">
                      {product.name}
                    </h2>
                    <div className="flex items-center gap-1.5 px-2 py-1 bg-secondary/60 border border-border shrink-0">
                      <Star className="w-3.5 h-3.5 text-primary fill-primary" />
                      <span className="font-mono text-xs font-semibold">{product.rating.toFixed(1)}</span>
                    </div>
                  </div>
                  
                  <div className="mt-3 flex flex-wrap items-baseline gap-3">
                    <span className="font-heading text-3xl text-foreground font-semibold">
                      ${product.price}
                    </span>
                    {product.member_price && (
                      <span className="text-xs font-mono font-medium text-primary bg-primary/10 border border-primary/25 px-2 py-0.5 uppercase tracking-wider">
                        Member Price: ${product.member_price}
                      </span>
                    )}
                    <span className="text-xs text-muted-foreground uppercase tracking-wider">
                      {isSoldOut ? 'Out of Stock' : `In Stock (${product.stock} available)`}
                    </span>
                  </div>
                </div>

                {/* Description */}
                <p className="text-sm text-foreground/75 leading-relaxed">
                  {product.description}
                </p>

                {/* Size Selector */}
                {product.sizes && product.sizes.length > 0 && (
                  <div className="pt-2">
                    <div className="flex justify-between items-center mb-2.5">
                      <span className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
                        Select Size
                      </span>
                      <span className="text-[0.7rem] text-primary font-mono">{selectedSize}</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {product.sizes.map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setSelectedSize(s)}
                          className={`min-h-[44px] min-w-[48px] px-3.5 text-xs font-mono uppercase tracking-wider border transition-all ${
                            selectedSize === s
                              ? 'border-primary bg-primary text-primary-foreground font-bold shadow-sm'
                              : 'border-border bg-background/60 text-foreground hover:border-primary/50'
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Flavor Selector */}
                {product.flavors && product.flavors.length > 0 && (
                  <div className="pt-2">
                    <div className="flex justify-between items-center mb-2.5">
                      <span className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
                        Flavor / Blend
                      </span>
                      <span className="text-[0.7rem] text-primary font-mono">{selectedFlavor}</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {product.flavors.map((flv) => (
                        <button
                          key={flv}
                          type="button"
                          onClick={() => setSelectedFlavor(flv)}
                          className={`min-h-[44px] px-4 text-xs tracking-wider border transition-all ${
                            selectedFlavor === flv
                              ? 'border-primary bg-primary text-primary-foreground font-medium shadow-sm'
                              : 'border-border bg-background/60 text-foreground hover:border-primary/50'
                          }`}
                        >
                          {flv}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quality Guarantee Note */}
                <div className="p-3.5 bg-secondary/30 border border-border/60 flex items-start gap-3 text-xs text-muted-foreground">
                  <ShieldCheck className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <span>
                    Apex Club Authentic Guarantee. Tested for athletic purity and crafted from commercial-grade materials.
                  </span>
                </div>

                {/* "You may also like" row */}
                {relatedProducts.length > 0 && (
                  <div className="pt-4 border-t border-border/60">
                    <p className="text-[0.68rem] uppercase tracking-ultra text-primary font-mono mb-3">
                      You May Also Like
                    </p>
                    <div className="grid grid-cols-3 gap-3">
                      {relatedProducts.map((rel) => (
                        <div
                          key={rel.id}
                          onClick={() => onSelectProduct?.(rel)}
                          className="group/rel cursor-pointer bg-card border border-border/50 p-2 text-left hover:border-primary/60 transition-colors"
                        >
                          <div className="relative aspect-square w-full bg-secondary/40 overflow-hidden mb-2">
                            <Image src={rel.image} alt={rel.name} fill sizes="100px" className="object-cover group-hover/rel:scale-105 transition-transform" />
                          </div>
                          <p className="text-[0.68rem] text-foreground font-medium line-clamp-1 group-hover/rel:text-primary">
                            {rel.name}
                          </p>
                          <p className="text-[0.65rem] text-primary font-mono font-semibold mt-0.5">
                            ${rel.price}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Footer / Add to Cart Actions */}
              <div className="border-t border-border/60 p-6 bg-card/60 backdrop-blur-sm space-y-4">
                <div className="flex items-center gap-4">
                  {/* Quantity adjustment */}
                  {!isSoldOut && (
                    <div className="flex items-center border border-border bg-background rounded-none">
                      <button
                        onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                        aria-label="Decrease quantity"
                        className="p-2 text-muted-foreground hover:text-foreground min-h-[44px] min-w-[44px] flex items-center justify-center transition-colors"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="px-3 text-xs font-mono font-semibold min-w-[32px] text-center">
                        {quantity}
                      </span>
                      <button
                        onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                        aria-label="Increase quantity"
                        className="p-2 text-muted-foreground hover:text-foreground min-h-[44px] min-w-[44px] flex items-center justify-center transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  {/* Add to cart CTA */}
                  <button
                    onClick={handleAddToCart}
                    disabled={isSoldOut}
                    className={`flex-1 min-h-[46px] text-xs uppercase tracking-wider font-semibold transition-all flex items-center justify-center gap-2 ${
                      isSoldOut
                        ? 'bg-secondary text-muted-foreground cursor-not-allowed border border-border'
                        : 'bg-primary text-primary-foreground hover:bg-primary/90'
                    }`}
                  >
                    {isSoldOut ? (
                      <>
                        <Ban className="w-4 h-4" />
                        <span>Sold Out</span>
                      </>
                    ) : isAdded ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Added to Bag</span>
                      </>
                    ) : (
                      <>
                        <ShoppingBag className="w-4 h-4" />
                        <span>Add to Cart · ${product.price * quantity}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
