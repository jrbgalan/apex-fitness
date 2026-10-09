'use client';

import React, { useState, useMemo } from 'react';
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  X,
  AlertTriangle,
  ShoppingBag,
  DollarSign,
  AlertCircle,
  PlusCircle,
  MinusCircle,
} from 'lucide-react';
import Image from 'next/image';
import { ProductItem, ProductCategory } from '@/types';
import { api } from '@/api/client';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface AdminProductsProps {
  products: ProductItem[];
  onRefresh: () => void;
}

const CATEGORIES: ('All' | ProductCategory)[] = [
  'All',
  'Apparel',
  'Supplements',
  'Equipment',
  'Accessories',
  'Wellness Tech',
];

const PRESET_PRODUCT_IMAGES = [
  'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&q=80&auto=format',
  'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&q=80&auto=format',
  'https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?w=800&q=80&auto=format',
  'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=800&q=80&auto=format',
  'https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=800&q=80&auto=format',
];

export default function AdminProducts({ products, onRefresh }: AdminProductsProps) {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Drawer Form State
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductItem | null>(null);
  const [productForm, setProductForm] = useState<Partial<ProductItem>>({
    name: '',
    category: 'Apparel',
    price: 48,
    stock: 25,
    description: '',
    image: PRESET_PRODUCT_IMAGES[0],
    badge: undefined,
  });

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState<ProductItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Filtered products
  const filtered = useMemo(() => {
    return products.filter((p) => {
      if (selectedCategory !== 'All' && p.category.toLowerCase() !== selectedCategory.toLowerCase()) {
        return false;
      }
      if (search.trim()) {
        const q = search.toLowerCase().trim();
        const mName = p.name.toLowerCase().includes(q);
        const mDesc = p.description.toLowerCase().includes(q);
        if (!mName && !mDesc) return false;
      }
      return true;
    });
  }, [products, selectedCategory, search]);

  // Inline Stock Update
  const handleUpdateStock = async (id: string, newStock: number) => {
    const safeStock = Math.max(0, newStock);
    try {
      await api.entities.Products.updateStock(id, safeStock);
      toast.success(`Inventory stock updated to ${safeStock}`);
      onRefresh();
    } catch {
      toast.error('Failed to update product stock.');
    }
  };

  const openDrawer = (p?: ProductItem) => {
    if (p) {
      setEditingProduct(p);
      setProductForm({ ...p });
    } else {
      setEditingProduct(null);
      setProductForm({
        name: '',
        category: 'Apparel',
        price: 48,
        stock: 25,
        description: '',
        image: PRESET_PRODUCT_IMAGES[0],
        badge: 'New',
      });
    }
    setDrawerOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productForm.name || !productForm.description) {
      toast.error('Please specify product name and description.');
      return;
    }

    try {
      if (editingProduct) {
        await api.entities.Products.update(editingProduct.id, {
          ...productForm,
          price: Number(productForm.price),
          stock: Number(productForm.stock),
        });
        toast.success(`Updated "${productForm.name}"`);
      } else {
        await api.entities.Products.create({
          name: productForm.name!,
          category: (productForm.category as ProductCategory) || 'Apparel',
          price: Number(productForm.price) || 48,
          stock: Number(productForm.stock) || 20,
          description: productForm.description!,
          image: productForm.image || PRESET_PRODUCT_IMAGES[0],
          badge: productForm.badge,
          rating: 4.9,
        });
        toast.success(`Added product "${productForm.name}"`);
      }
      setDrawerOpen(false);
      onRefresh();
    } catch {
      toast.error('Failed to save product.');
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.entities.Products.delete(deleteTarget.id);
      toast.success(`Removed "${deleteTarget.name}" from catalog.`);
      setDeleteTarget(null);
      onRefresh();
    } catch {
      toast.error('Failed to remove product.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6 select-none">
      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search merchandise catalog..."
            className="w-full min-h-[44px] pl-10 pr-3 bg-card/60 border border-border/70 text-xs font-mono text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary transition-colors"
          />
        </div>

        {/* Filter & Add */}
        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="min-h-[44px] px-3 bg-card/60 border border-border/70 text-xs font-mono text-foreground focus:outline-none focus:border-primary cursor-pointer"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat} className="bg-[#121212] text-foreground">
                {cat === 'All' ? 'All Collections' : cat}
              </option>
            ))}
          </select>

          <button
            onClick={() => openDrawer()}
            className="min-h-[44px] px-4 py-2 bg-primary text-primary-foreground text-xs uppercase tracking-wider font-mono font-semibold hover:bg-primary/90 transition-all flex items-center gap-2 shadow-lg"
          >
            <Plus className="w-4 h-4" />
            <span>Add Product</span>
          </button>
        </div>
      </div>

      {/* Main Products Table / Stacked Cards */}
      <div className="border border-border/70 bg-card/50 overflow-hidden">
        <table className="w-full text-left text-xs font-mono hidden md:table">
          <thead className="border-b border-border/70 bg-muted/20 text-muted-foreground uppercase text-[0.66rem] tracking-wider">
            <tr>
              <th className="py-3 px-4">Item</th>
              <th className="py-3 px-4">Collection</th>
              <th className="py-3 px-4">Price</th>
              <th className="py-3 px-4">Inventory Stock (Inline Edit)</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {filtered.map((prod) => (
              <tr key={prod.id} className="hover:bg-card/80 transition-colors">
                <td className="py-3.5 px-4 flex items-center gap-3">
                  <div className="relative w-12 h-12 bg-neutral-900 border border-border/60 shrink-0 overflow-hidden">
                    <Image
                      src={prod.image}
                      alt={prod.name}
                      fill
                      sizes="48px"
                      className="object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <div className="font-medium text-foreground text-xs truncate max-w-[200px]">
                      {prod.name}
                    </div>
                    {prod.badge && (
                      <span className="text-[0.6rem] uppercase tracking-wider px-1.5 py-0.2 bg-primary/20 text-primary border border-primary/30 inline-block mt-0.5">
                        {prod.badge}
                      </span>
                    )}
                  </div>
                </td>

                <td className="py-3.5 px-4 text-muted-foreground">{prod.category}</td>

                <td className="py-3.5 px-4 text-primary font-bold">${prod.price}</td>

                {/* Inline Stock Stepper */}
                <td className="py-3.5 px-4">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleUpdateStock(prod.id, prod.stock - 1)}
                      className="p-1 text-muted-foreground hover:text-foreground hover:bg-card/80 transition-colors"
                      title="Decrement Stock"
                    >
                      <MinusCircle className="w-4 h-4" />
                    </button>
                    <input
                      type="number"
                      value={prod.stock}
                      onChange={(e) => handleUpdateStock(prod.id, Number(e.target.value))}
                      className="w-16 h-8 text-center bg-background border border-border/70 text-foreground font-bold focus:outline-none focus:border-primary text-xs"
                    />
                    <button
                      onClick={() => handleUpdateStock(prod.id, prod.stock + 1)}
                      className="p-1 text-muted-foreground hover:text-foreground hover:bg-card/80 transition-colors"
                      title="Increment Stock"
                    >
                      <PlusCircle className="w-4 h-4" />
                    </button>
                  </div>
                </td>

                {/* Stock Warning Badge */}
                <td className="py-3.5 px-4">
                  {prod.stock === 0 ? (
                    <span className="px-2 py-0.5 bg-red-500/15 border border-red-500/30 text-red-400 text-[0.68rem] font-bold uppercase tracking-wider">
                      Sold Out
                    </span>
                  ) : prod.stock < 5 ? (
                    <span className="px-2 py-0.5 bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[0.68rem] font-bold uppercase tracking-wider flex items-center gap-1 w-fit">
                      <AlertTriangle className="w-3 h-3" />
                      <span>Low ({prod.stock})</span>
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[0.68rem] font-bold uppercase tracking-wider">
                      In Stock
                    </span>
                  )}
                </td>

                <td className="py-3.5 px-4 text-right">
                  <button
                    onClick={() => openDrawer(prod)}
                    className="p-1.5 text-muted-foreground hover:text-primary transition-colors mr-1"
                    title="Edit Product"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleteTarget(prod)}
                    className="p-1.5 text-muted-foreground hover:text-red-400 transition-colors"
                    title="Delete Product"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Mobile View */}
        <div className="md:hidden divide-y divide-border/60">
          {filtered.map((prod) => (
            <div key={prod.id} className="p-4 space-y-3">
              <div className="flex items-center gap-3">
                <div className="relative w-14 h-14 bg-neutral-900 border border-border/60 shrink-0 overflow-hidden">
                  <Image src={prod.image} alt={prod.name} fill sizes="56px" className="object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-heading text-sm font-semibold text-foreground truncate">
                    {prod.name}
                  </h4>
                  <div className="text-xs text-primary font-mono mt-0.5">${prod.price}</div>
                  <div className="text-[0.68rem] text-muted-foreground font-mono">
                    {prod.category}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs font-mono pt-2 border-t border-border/50">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Stock:</span>
                  <input
                    type="number"
                    value={prod.stock}
                    onChange={(e) => handleUpdateStock(prod.id, Number(e.target.value))}
                    className="w-16 h-8 text-center bg-background border border-border/70 text-foreground font-bold text-xs"
                  />
                </div>

                {prod.stock === 0 ? (
                  <span className="text-red-400 text-[0.68rem] font-bold uppercase">Sold Out</span>
                ) : prod.stock < 5 ? (
                  <span className="text-amber-400 text-[0.68rem] font-bold uppercase">
                    Low Stock ({prod.stock})
                  </span>
                ) : (
                  <span className="text-emerald-400 text-[0.68rem] font-bold uppercase">In Stock</span>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-2 border-t border-border/50">
                <button
                  onClick={() => openDrawer(prod)}
                  className="min-h-[44px] px-3 text-xs font-mono text-primary flex items-center gap-1.5"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => setDeleteTarget(prod)}
                  className="min-h-[44px] px-3 text-xs font-mono text-red-400 flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Product Drawer Form */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setDrawerOpen(false)} />
          <div className="relative w-full max-w-lg bg-[#141414] border-l border-border/80 h-full p-6 sm:p-8 z-10 overflow-y-auto space-y-6 animate-in slide-in-from-right duration-250">
            <div className="flex items-center justify-between pb-3 border-b border-border/70">
              <h3 className="font-heading text-xl font-semibold text-foreground">
                {editingProduct ? 'Edit Merchandise Item' : 'Add Merchandise Item'}
              </h3>
              <button onClick={() => setDrawerOpen(false)} className="p-2 text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4 font-mono text-xs">
              <div>
                <label className="text-muted-foreground block mb-1">Product Title</label>
                <input
                  type="text"
                  required
                  value={productForm.name || ''}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  placeholder="e.g. Apex Heavyweight Tee"
                  className="w-full min-h-[44px] px-3 bg-background border border-border/70 text-foreground focus:outline-none focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-muted-foreground block mb-1">Collection</label>
                  <select
                    value={productForm.category || 'Apparel'}
                    onChange={(e) =>
                      setProductForm({ ...productForm, category: e.target.value as ProductCategory })
                    }
                    className="w-full min-h-[44px] px-3 bg-background border border-border/70 text-foreground focus:outline-none focus:border-primary"
                  >
                    {CATEGORIES.filter((c) => c !== 'All').map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-muted-foreground block mb-1">Promotional Badge</label>
                  <select
                    value={productForm.badge || ''}
                    onChange={(e) =>
                      setProductForm({
                        ...productForm,
                        badge: (e.target.value || undefined) as any,
                      })
                    }
                    className="w-full min-h-[44px] px-3 bg-background border border-border/70 text-foreground focus:outline-none focus:border-primary"
                  >
                    <option value="">None</option>
                    <option value="New">New</option>
                    <option value="Best Seller">Best Seller</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-muted-foreground block mb-1">Price ($ USD)</label>
                  <input
                    type="number"
                    required
                    value={productForm.price || 48}
                    onChange={(e) => setProductForm({ ...productForm, price: Number(e.target.value) })}
                    className="w-full min-h-[44px] px-3 bg-background border border-border/70 text-foreground focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="text-muted-foreground block mb-1">Initial Stock Units</label>
                  <input
                    type="number"
                    required
                    value={productForm.stock || 20}
                    onChange={(e) => setProductForm({ ...productForm, stock: Number(e.target.value) })}
                    className="w-full min-h-[44px] px-3 bg-background border border-border/70 text-foreground focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div>
                <label className="text-muted-foreground block mb-1">Product Image URL</label>
                <input
                  type="url"
                  value={productForm.image || ''}
                  onChange={(e) => setProductForm({ ...productForm, image: e.target.value })}
                  className="w-full min-h-[44px] px-3 bg-background border border-border/70 text-foreground focus:outline-none focus:border-primary"
                />
                <div className="flex gap-2 mt-2 overflow-x-auto no-scrollbar">
                  {PRESET_PRODUCT_IMAGES.map((img, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setProductForm({ ...productForm, image: img })}
                      className="w-12 h-10 relative border border-border shrink-0 overflow-hidden hover:border-primary"
                    >
                      <Image src={img} alt="Preset" fill sizes="48px" className="object-cover" />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-muted-foreground block mb-1">Product Description</label>
                <textarea
                  rows={4}
                  required
                  value={productForm.description || ''}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  placeholder="Material specs, fabrication details..."
                  className="w-full p-3 bg-background border border-border/70 text-foreground focus:outline-none focus:border-primary"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setDrawerOpen(false)}
                  className="min-h-[44px] px-4 py-2 border border-border text-muted-foreground hover:text-foreground"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="min-h-[44px] px-6 py-2 bg-primary text-primary-foreground font-semibold hover:bg-primary/90"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#141414] border border-border/80 max-w-md w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center gap-3 text-red-400">
              <AlertCircle className="w-6 h-6 shrink-0" />
              <h3 className="font-heading text-lg font-semibold text-foreground">
                Confirm Product Removal
              </h3>
            </div>
            <p className="text-xs text-muted-foreground font-mono leading-relaxed">
              Are you sure you wish to delete <strong className="text-foreground">{deleteTarget.name}</strong>?
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setDeleteTarget(null)}
                className="min-h-[44px] px-4 py-2 border border-border text-xs uppercase tracking-wider font-mono hover:text-foreground"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleting}
                className="min-h-[44px] px-5 py-2 bg-red-600 text-white text-xs uppercase tracking-wider font-mono font-semibold hover:bg-red-700 disabled:opacity-50"
              >
                {deleting ? 'Deleting...' : 'Delete Product'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
