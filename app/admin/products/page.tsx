"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, doc, deleteDoc, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Link from "next/link";
import { Plus, Search, Edit2, Trash2, Loader2, Image as ImageIcon } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";

export default function AdminProducts() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchProducts = async () => {
    try {
      const q = query(collection(db, "products"), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map((doc: any) => ({
        id: doc.id,
        ...doc.data()
      }));
      setProducts(data);
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete ${name}?`)) {
      try {
        await deleteDoc(doc(db, "products", id));
        toast.success("Product deleted successfully");
        setProducts(products.filter(p => p.id !== id));
      } catch (error) {
        console.error("Error deleting product:", error);
        toast.error("Failed to delete product");
      }
    }
  };

  const filteredProducts = products.filter(p => 
    p.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.category?.toLowerCase().includes(search.toLowerCase()) ||
    p.brand?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1a1917]">Products</h1>
          <p className="text-[#1a1917]/50 text-sm mt-1">Manage your store's inventory</p>
        </div>
        <Link 
          href="/admin/products/new"
          className="bg-[#FF6A2A] hover:bg-[#e5591c] text-white font-bold py-2.5 px-5 rounded-xl transition-colors flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add Product
        </Link>
      </div>

      <div className="bg-white border border-[#1a1917]/5 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-[#1a1917]/5 bg-white">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#1a1917]/30" />
            <input 
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white border border-[#1a1917]/10 rounded-lg py-2 pl-9 pr-4 text-[#1a1917] text-sm focus:outline-none focus:border-[#FF6A2A] transition-colors"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-[#1a1917]/70">
            <thead className="text-xs uppercase bg-white text-[#1a1917]/40 border-b border-[#1a1917]/5">
              <tr>
                <th className="px-6 py-4 font-semibold">Product</th>
                <th className="px-6 py-4 font-semibold">Category</th>
                <th className="px-6 py-4 font-semibold">Brand</th>
                <th className="px-6 py-4 font-semibold">Price</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1a1917]/5">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#FF6A2A]" />
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-[#1a1917]/40">
                    No products found.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-[#1a1917]/5 border border-[#1a1917]/10 flex items-center justify-center shrink-0">
                          {product.images?.[0] ? (
                            <Image src={product.images[0]} alt={product.name} fill className="object-cover" />
                          ) : (
                            <ImageIcon className="w-5 h-5 text-[#1a1917]/20" />
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-[#1a1917]">{product.name}</div>
                          <div className="text-xs text-[#1a1917]/40 truncate w-48">{product.slug}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium">{product.category}</td>
                    <td className="px-6 py-4">{product.brand || '-'}</td>
                    <td className="px-6 py-4">
                      {product.currency || 'PKR'} {product.price?.toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      {product.availability === 'in-stock' ? (
                        <span className="bg-emerald-500/10 text-emerald-400 px-2.5 py-1 rounded-full text-xs font-semibold">In Stock</span>
                      ) : (
                        <span className="bg-red-500/10 text-red-400 px-2.5 py-1 rounded-full text-xs font-semibold">Out of Stock</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link 
                          href={`/admin/products/${product.id}`}
                          className="p-2 text-[#1a1917]/40 hover:text-[#1a1917] hover:bg-[#1a1917]/5 rounded-lg transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Link>
                        <button 
                          onClick={() => handleDelete(product.id, product.name)}
                          className="p-2 text-[#1a1917]/40 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
