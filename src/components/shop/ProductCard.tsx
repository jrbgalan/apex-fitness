'use client';
import { useState } from 'react';
import Image from 'next/image';
import { Star, Plus, Check } from 'lucide-react';
import { ProductItem } from '@/types';
import { cn } from '@/lib/utils';
import { useCart } from '@/lib/CartContext';

interface ProductCardProps {
  product: ProductItem;
  onOpenDetail: (product: ProductItem) => void;
}

export default function ProductCard({ product, onOpenDetail }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [added, setAdded] = useState(false);
  const { addToCart } = useCart();

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    // If product has multiple sizes or flavors, open detail drawer to pick
    if ((product.sizes && product.sizes.length > 1) || (product.flavors && product.flavors.length > 1)) {
      onOpenDetail(product);
      return;
    }

    addToCart(
      product,
      1,
      product.sizes ? product.sizes[0] : undefined,
      product.flavors ? product.flavors[0] : undefined
    );
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <div
      onClick={() => onOpenDetail(product)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onOpenDetail(product);
        }
      }}
      className="group relative flex flex-col bg-card border border-border/70 hover:border-border text-left cursor-pointer transition-all duration-300 focus-visible:ring-2 focus-visible:ring-primary"
    >
      {/* Product Image Container with Image Hover Swap */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-secondary/40">
        {/* Base Image */}
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className={cn(
            'object-cover transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]',
            product.hover_image && isHovered ? 'opacity-0 scale-105' : 'opacity-100 scale-100'
          )}
        />

        {/* Hover Image (if present) */}
        {product.hover_image && (
          <Image
            src={product.hover_image}
            alt={`${product.name} alternate view`}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className={cn(
              'object-cover transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] absolute inset-0',
              isHovered ? 'opacity-100 scale-105' : 'opacity-0 scale-100'
            )}
          />
        )}

        {/* Dark cohesive overlay */}
        <div className="absolute inset-0 bg-background/20 group-hover:bg-background/10 transition-colors pointer-events-none" />

        {/* Badge */}
        {product.badge && (
          <div className="absolute top-3 left-3 z-10">
            <span
              className={cn(
                'text-[0.62rem] uppercase tracking-wider font-semibold px-2.5 py-1 backdrop-blur-sm',
                product.badge === 'Best Seller'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-background/85 text-foreground border border-border/80'
              )}
            >
              {product.badge}
            </span>
          </div>
        )}

        {/* Quick Add Overlay Button */}
        <button
          onClick={handleQuickAdd}
          aria-label={`Quick add ${product.name} to cart`}
          className={cn(
            'absolute bottom-3 right-3 z-10 flex items-center justify-center min-h-[44px] min-w-[44px] rounded-none transition-all duration-300 shadow-md',
            added
              ? 'bg-primary text-primary-foreground opacity-100'
              : 'bg-background/90 text-foreground hover:bg-primary hover:text-primary-foreground opacity-95 sm:opacity-0 sm:group-hover:opacity-100 sm:translate-y-2 sm:group-hover:translate-y-0'
          )}
        >
          {added ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
        </button>
      </div>

      {/* Product Details */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <span className="text-[0.65rem] uppercase tracking-ultra text-primary font-mono">
              {product.category}
            </span>
            <div className="flex items-center gap-1 text-[0.7rem] text-muted-foreground">
              <Star className="w-3.5 h-3.5 text-primary fill-primary" />
              <span className="font-mono font-medium">{product.rating.toFixed(1)}</span>
            </div>
          </div>

          <h3 className="font-heading text-base text-foreground line-clamp-1 group-hover:text-primary transition-colors">
            {product.name}
          </h3>

          <p className="mt-1 text-xs text-muted-foreground line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        </div>

        <div className="mt-4 pt-3 border-t border-border/40 flex items-center justify-between">
          <span className="font-heading text-lg text-foreground font-semibold">
            ${product.price}
          </span>
          <span className="text-[0.68rem] uppercase tracking-wider text-muted-foreground group-hover:text-foreground transition-colors flex items-center gap-1">
            Details →
          </span>
        </div>
      </div>
    </div>
  );
}

