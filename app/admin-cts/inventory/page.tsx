"use client";

import { useEffect, useMemo, useState } from "react";
import { collection, onSnapshot, query, orderBy, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import { getPublicUploadUrl } from "@/lib/utils";
import { Product, InventoryLog } from "@/data/products";
import { getStockInfo, calculateTotalStock } from "@/lib/inventory-engine";
import {
  Boxes,
  Search,
  Filter,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  TrendingDown,
  History,
  Plus,
  Minus,
  Edit2,
  Loader2,
  ArrowUpDown,
  Layers,
  Save,
  RefreshCw,
  Package,
  CheckSquare,
  Square
} from "lucide-react";

export default function AdminInventoryPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [products, setProducts] = useState<Product[]>([]);
  const [logs, setLogs] = useState<InventoryLog[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  // Filters & Controls
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "in_stock" | "low_stock" | "out_of_stock">("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [threshold, setThreshold] = useState(5);

  // Inline Editing
  const [editingStockId, setEditingStockId] = useState<string | null>(null);
  const [editingStockValue, setEditingStockValue] = useState<number>(0);
  const [isSavingInline, setIsSavingInline] = useState(false);

  // Bulk Selection
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [bulkModalOpen, setBulkModalOpen] = useState(false);
  const [bulkAction, setBulkAction] = useState<"set" | "add" | "subtract">("add");
  const [bulkValue, setBulkValue] = useState<number>(10);
  const [isProcessingBulk, setIsProcessingBulk] = useState(false);

  // Audit History Modal
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [historyFilterProduct, setHistoryFilterProduct] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/admin-cts/login");
    }
  }, [user, loading, router]);

  // Real-time Firestore Listeners
  useEffect(() => {
    if (!user) return;

    // Listen to products
    const qProducts = query(collection(db, "products"), orderBy("name", "asc"));
    const unsubProducts = onSnapshot(
      qProducts,
      (snap) => {
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() })) as Product[];
        setProducts(list);
        setLoadingData(false);
      },
      (err) => {
        console.error("Failed to load products:", err);
        toast.error("Failed to load products");
        setLoadingData(false);
      }
    );

    // Listen to inventory logs
    const qLogs = query(collection(db, "inventory_logs"), orderBy("createdAt", "desc"), limit(100));
    const unsubLogs = onSnapshot(
      qLogs,
      (snap) => {
        const logList = snap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
          createdAt: d.data().createdAt?.toDate ? d.data().createdAt.toDate().toISOString() : d.data().createdAt,
        })) as InventoryLog[];
        setLogs(logList);
      },
      (err) => {
        console.error("Failed to load inventory logs:", err);
      }
    );

    return () => {
      unsubProducts();
      unsubLogs();
    };
  }, [user]);

  // Unique Categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return Array.from(set).sort();
  }, [products]);

  // Compute stock state for all products
  const productsWithStock = useMemo(() => {
    return products.map((p) => {
      const stockInfo = getStockInfo(p, null, null, threshold);
      return {
        ...p,
        computedStock: stockInfo.stock,
        stockStatus: stockInfo.status,
        stockLabel: stockInfo.label,
        stockBadgeClass: stockInfo.badgeClass,
      };
    });
  }, [products, threshold]);

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return productsWithStock.filter((p) => {
      if (statusFilter !== "all" && p.stockStatus !== statusFilter) return false;
      if (categoryFilter !== "all" && p.category !== categoryFilter) return false;
      if (searchTerm) {
        const lower = searchTerm.toLowerCase();
        const matchesName = p.name.toLowerCase().includes(lower);
        const matchesBrand = p.brand?.toLowerCase().includes(lower);
        const matchesCategory = p.category?.toLowerCase().includes(lower);
        const matchesSlug = p.slug?.toLowerCase().includes(lower);
        if (!matchesName && !matchesBrand && !matchesCategory && !matchesSlug) return false;
      }
      return true;
    });
  }, [productsWithStock, statusFilter, categoryFilter, searchTerm]);

  // KPI Metrics
  const metrics = useMemo(() => {
    const totalProducts = productsWithStock.length;
    let totalUnits = 0;
    let lowStockCount = 0;
    let outOfStockCount = 0;

    productsWithStock.forEach((p) => {
      totalUnits += p.computedStock;
      if (p.stockStatus === "out_of_stock") outOfStockCount++;
      else if (p.stockStatus === "low_stock") lowStockCount++;
    });

    return { totalProducts, totalUnits, lowStockCount, outOfStockCount };
  }, [productsWithStock]);

  // Quick Adjustment Handler
  const handleQuickAdjust = async (product: Product, change: number) => {
    const currentStock = calculateTotalStock(product);
    const newStock = Math.max(0, currentStock + change);

    try {
      const res = await fetch("/api/admin/inventory/adjust", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
          change,
          reason: `Quick inline adjustment (${change > 0 ? "+" : ""}${change})`,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to adjust stock");

      toast.success(`${product.name}: stock updated to ${newStock}`);
    } catch (err: any) {
      console.error("Quick adjust error:", err);
      toast.error(err.message || "Failed to adjust stock");
    }
  };

  // Inline Direct Save Handler
  const handleSaveInline = async (product: Product) => {
    if (editingStockValue < 0) {
      toast.error("Stock quantity cannot be negative");
      return;
    }

    setIsSavingInline(true);
    try {
      const res = await fetch("/api/admin/inventory/adjust", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
          setStock: editingStockValue,
          reason: "Manual inline stock edit",
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update stock");

      toast.success(`${product.name}: stock set to ${editingStockValue}`);
      setEditingStockId(null);
    } catch (err: any) {
      console.error("Save inline error:", err);
      toast.error(err.message || "Failed to update stock");
    } finally {
      setIsSavingInline(false);
    }
  };

  // Bulk Selection Toggles
  const handleSelectAll = () => {
    if (selectedProductIds.length === filteredProducts.length) {
      setSelectedProductIds([]);
    } else {
      setSelectedProductIds(filteredProducts.map((p) => p.id));
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedProductIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Bulk Update Submit
  const handleExecuteBulk = async () => {
    if (selectedProductIds.length === 0) return;
    setIsProcessingBulk(true);

    try {
      const adjustments = selectedProductIds.map((id) => {
        if (bulkAction === "set") {
          return { productId: id, setStock: bulkValue, reason: `Bulk set to ${bulkValue}` };
        } else if (bulkAction === "add") {
          return { productId: id, change: bulkValue, reason: `Bulk added +${bulkValue}` };
        } else {
          return { productId: id, change: -bulkValue, reason: `Bulk subtracted -${bulkValue}` };
        }
      });

      const res = await fetch("/api/admin/inventory/adjust", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adjustments }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Bulk update failed");

      toast.success(`Successfully updated ${data.updatedCount} products`);
      setBulkModalOpen(false);
      setSelectedProductIds([]);
    } catch (err: any) {
      console.error("Bulk update error:", err);
      toast.error(err.message || "Bulk update failed");
    } finally {
      setIsProcessingBulk(false);
    }
  };

  if (loading || loadingData) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[#FF6A2A]" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-orange-500/10 text-[#FF6A2A] rounded-2xl">
              <Boxes className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-[#1a1917]">Inventory Management</h1>
              <p className="text-xs text-[#1a1917]/50 mt-0.5">Real-time stock control, variant allocation, and audit ledger</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={() => setHistoryModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-black/10 hover:border-black/20 text-[#1a1917] rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer"
          >
            <History className="w-4 h-4 text-[#FF6A2A]" />
            <span>Audit History</span>
          </button>

          {selectedProductIds.length > 0 && (
            <button
              onClick={() => setBulkModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#FF6A2A] text-white hover:bg-[#e5591c] rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer"
            >
              <Layers className="w-4 h-4" />
              <span>Bulk Update ({selectedProductIds.length})</span>
            </button>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-black/5 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Total Products</span>
            <div className="p-2 bg-black/5 rounded-xl text-black/60">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-[#1a1917]">{metrics.totalProducts}</span>
          </div>
        </div>

        <div className="bg-white border border-black/5 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Units in Stock</span>
            <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-600">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-emerald-600">{metrics.totalUnits.toLocaleString()}</span>
          </div>
        </div>

        <div className="bg-white border border-black/5 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Low Stock Alerts</span>
            <div className="p-2 bg-amber-500/10 rounded-xl text-amber-600">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-amber-600">{metrics.lowStockCount}</span>
          </div>
        </div>

        <div className="bg-white border border-black/5 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Out of Stock</span>
            <div className="p-2 bg-red-500/10 rounded-xl text-red-600">
              <XCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-red-600">{metrics.outOfStockCount}</span>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white border border-black/5 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by product, category, brand..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#faf9f6] border border-black/10 rounded-xl pl-10 pr-4 py-2 text-xs font-medium outline-none focus:border-[#FF6A2A] transition-colors"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 w-full md:w-auto flex-wrap">
          {/* Status Tabs */}
          <div className="flex items-center bg-[#faf9f6] p-1 rounded-xl border border-black/5 text-xs font-bold">
            <button
              onClick={() => setStatusFilter("all")}
              className={`px-3 py-1.5 rounded-lg transition-all ${statusFilter === "all" ? "bg-white shadow-sm text-[#1a1917]" : "text-muted-foreground hover:text-[#1a1917]"}`}
            >
              All ({productsWithStock.length})
            </button>
            <button
              onClick={() => setStatusFilter("in_stock")}
              className={`px-3 py-1.5 rounded-lg transition-all ${statusFilter === "in_stock" ? "bg-white shadow-sm text-emerald-600" : "text-muted-foreground hover:text-emerald-600"}`}
            >
              In Stock
            </button>
            <button
              onClick={() => setStatusFilter("low_stock")}
              className={`px-3 py-1.5 rounded-lg transition-all ${statusFilter === "low_stock" ? "bg-white shadow-sm text-amber-600" : "text-muted-foreground hover:text-amber-600"}`}
            >
              Low ({metrics.lowStockCount})
            </button>
            <button
              onClick={() => setStatusFilter("out_of_stock")}
              className={`px-3 py-1.5 rounded-lg transition-all ${statusFilter === "out_of_stock" ? "bg-white shadow-sm text-red-600" : "text-muted-foreground hover:text-red-600"}`}
            >
              Out ({metrics.outOfStockCount})
            </button>
          </div>

          {/* Category Dropdown */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-[#faf9f6] border border-black/10 rounded-xl px-3 py-2 text-xs font-bold text-[#1a1917] outline-none"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          {/* Low Stock Threshold Setter */}
          <div className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground bg-[#faf9f6] px-3 py-1.5 rounded-xl border border-black/5">
            <span>Threshold:</span>
            <input
              type="number"
              min="1"
              max="100"
              value={threshold}
              onChange={(e) => setThreshold(Math.max(1, Number(e.target.value) || 1))}
              className="w-12 text-center bg-white border border-black/10 rounded-lg py-0.5 text-xs font-bold text-[#1a1917]"
            />
          </div>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white border border-black/5 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-[#1a1917]">
            <thead className="bg-[#faf9f6] text-[10px] uppercase font-bold text-muted-foreground border-b border-black/5">
              <tr>
                <th className="p-4 w-10">
                  <button onClick={handleSelectAll} className="cursor-pointer text-[#1a1917]">
                    {selectedProductIds.length === filteredProducts.length && filteredProducts.length > 0 ? (
                      <CheckSquare className="w-4 h-4 text-[#FF6A2A]" />
                    ) : (
                      <Square className="w-4 h-4 text-black/30" />
                    )}
                  </button>
                </th>
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Stock Units</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Quick Adjust</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-muted-foreground text-xs">
                    No products found matching the selected inventory criteria.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => {
                  const isSelected = selectedProductIds.includes(product.id);
                  const isEditing = editingStockId === product.id;
                  const hasVariants = product.variants && product.variants.length > 0;

                  return (
                    <tr key={product.id} className={`hover:bg-black/[0.01] transition-colors ${isSelected ? "bg-[#FF6A2A]/5" : ""}`}>
                      {/* Checkbox */}
                      <td className="p-4">
                        <button onClick={() => handleToggleSelect(product.id)} className="cursor-pointer">
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-[#FF6A2A]" />
                          ) : (
                            <Square className="w-4 h-4 text-black/20" />
                          )}
                        </button>
                      </td>

                      {/* Product Name & Image */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="relative w-11 h-11 rounded-xl overflow-hidden bg-black/5 border border-black/5 shrink-0">
                            {product.images && product.images.length > 0 ? (
                              <Image
                                src={getPublicUploadUrl(product.images[0])}
                                alt={product.name}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="flex items-center justify-center h-full text-muted-foreground text-[10px]">
                                No img
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <Link
                              href={`/admin-cts/products/${product.id}`}
                              className="font-bold text-xs text-[#1a1917] hover:text-[#FF6A2A] transition-colors line-clamp-1"
                            >
                              {product.name}
                            </Link>
                            <div className="text-[10px] text-muted-foreground flex items-center gap-2 mt-0.5">
                              <span>SKU: {product.slug || product.id.slice(0, 8)}</span>
                              {hasVariants && (
                                <span className="bg-orange-500/10 text-[#FF6A2A] px-1.5 py-0.2 rounded font-bold">
                                  {product.variants!.length} variants
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="px-4 py-3 text-xs text-muted-foreground">{product.category || "-"}</td>

                      {/* Price */}
                      <td className="px-4 py-3 text-xs font-bold text-[#1a1917]">
                        Rs. {product.price?.toLocaleString()}
                      </td>

                      {/* Stock Quantity Column */}
                      <td className="px-4 py-3">
                        {isEditing ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              min="0"
                              value={editingStockValue}
                              onChange={(e) => setEditingStockValue(Math.max(0, Number(e.target.value) || 0))}
                              className="w-20 bg-white border border-[#FF6A2A] rounded-lg px-2 py-1 text-xs font-bold text-center outline-none"
                              autoFocus
                            />
                            <button
                              onClick={() => handleSaveInline(product)}
                              disabled={isSavingInline}
                              className="p-1.5 bg-[#FF6A2A] text-white rounded-lg hover:bg-[#e5591c] transition-colors cursor-pointer"
                              title="Save stock"
                            >
                              {isSavingInline ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                            </button>
                            <button
                              onClick={() => setEditingStockId(null)}
                              className="text-xs text-muted-foreground hover:text-black"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div
                            onClick={() => {
                              setEditingStockId(product.id);
                              setEditingStockValue(product.computedStock);
                            }}
                            className="group flex items-center gap-2 cursor-pointer"
                            title="Click to edit quantity"
                          >
                            <span className="font-extrabold text-sm text-[#1a1917]">{product.computedStock}</span>
                            <Edit2 className="w-3 h-3 text-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                        )}
                      </td>

                      {/* Status Badge */}
                      <td className="px-4 py-3">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wide border ${product.stockBadgeClass}`}>
                          {product.stockLabel}
                        </span>
                      </td>

                      {/* Quick Adjust Buttons */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleQuickAdjust(product, -1)}
                            disabled={product.computedStock <= 0}
                            className="p-1 rounded-lg border border-black/10 bg-[#faf9f6] hover:bg-black/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-xs font-bold cursor-pointer"
                            title="Subtract 1 unit"
                          >
                            <Minus className="w-3 h-3 text-black/70" />
                          </button>
                          <button
                            onClick={() => handleQuickAdjust(product, 1)}
                            className="p-1 rounded-lg border border-black/10 bg-[#faf9f6] hover:bg-black/5 transition-colors text-xs font-bold cursor-pointer"
                            title="Add 1 unit"
                          >
                            <Plus className="w-3 h-3 text-black/70" />
                          </button>
                          <button
                            onClick={() => handleQuickAdjust(product, 5)}
                            className="px-2 py-0.5 rounded-lg border border-black/10 bg-[#faf9f6] hover:bg-black/5 transition-colors text-[10px] font-bold text-black/70 cursor-pointer"
                            title="Add 5 units"
                          >
                            +5
                          </button>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setHistoryFilterProduct(product.id);
                              setHistoryModalOpen(true);
                            }}
                            className="p-1.5 text-black/40 hover:text-[#FF6A2A] hover:bg-orange-500/10 rounded-lg transition-colors cursor-pointer"
                            title="View product inventory log"
                          >
                            <History className="w-4 h-4" />
                          </button>
                          <Link
                            href={`/admin-cts/products/${product.id}`}
                            className="p-1.5 text-black/40 hover:text-[#1a1917] hover:bg-black/5 rounded-lg transition-colors"
                            title="Edit full product"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bulk Update Modal */}
      {bulkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl space-y-5 border border-black/10">
            <div className="flex items-center gap-3 border-b border-black/5 pb-4">
              <div className="p-2.5 bg-orange-500/10 text-[#FF6A2A] rounded-xl">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-[#1a1917]">Bulk Inventory Update</h3>
                <p className="text-xs text-muted-foreground">{selectedProductIds.length} products selected</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-[#1a1917]/70 uppercase tracking-wider block mb-1.5">Action</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setBulkAction("add")}
                    className={`py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${bulkAction === "add" ? "bg-[#FF6A2A] text-white border-[#FF6A2A]" : "border-black/10 bg-[#faf9f6]"}`}
                  >
                    Add Stock (+)
                  </button>
                  <button
                    type="button"
                    onClick={() => setBulkAction("subtract")}
                    className={`py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${bulkAction === "subtract" ? "bg-[#FF6A2A] text-white border-[#FF6A2A]" : "border-black/10 bg-[#faf9f6]"}`}
                  >
                    Subtract (-)
                  </button>
                  <button
                    type="button"
                    onClick={() => setBulkAction("set")}
                    className={`py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${bulkAction === "set" ? "bg-[#FF6A2A] text-white border-[#FF6A2A]" : "border-black/10 bg-[#faf9f6]"}`}
                  >
                    Set Exact (=)
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-[#1a1917]/70 uppercase tracking-wider block mb-1.5">Quantity Value</label>
                <input
                  type="number"
                  min="0"
                  value={bulkValue}
                  onChange={(e) => setBulkValue(Math.max(0, Number(e.target.value) || 0))}
                  className="w-full bg-[#faf9f6] border border-black/10 rounded-xl px-4 py-2.5 text-sm font-bold text-[#1a1917] outline-none focus:border-[#FF6A2A]"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setBulkModalOpen(false)}
                disabled={isProcessingBulk}
                className="px-4 py-2 text-xs font-bold text-muted-foreground hover:bg-black/5 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteBulk}
                disabled={isProcessingBulk}
                className="px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white bg-[#FF6A2A] hover:bg-[#e5591c] rounded-xl shadow-md transition-colors cursor-pointer flex items-center gap-2"
              >
                {isProcessingBulk ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                <span>Apply to {selectedProductIds.length} Products</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Audit History Modal */}
      {historyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-2xl bg-white rounded-2xl p-6 shadow-2xl space-y-4 border border-black/10 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-black/5 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-orange-500/10 text-[#FF6A2A] rounded-xl">
                  <History className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-[#1a1917]">Inventory Audit Ledger</h3>
                  <p className="text-xs text-muted-foreground">Immutable history of sales, cancellations, refunds, and adjustments</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setHistoryModalOpen(false);
                  setHistoryFilterProduct(null);
                }}
                className="p-1.5 text-muted-foreground hover:text-black rounded-lg hover:bg-black/5 transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {historyFilterProduct && (
              <div className="flex items-center justify-between bg-orange-500/5 px-3.5 py-2 rounded-xl border border-orange-500/15 text-xs">
                <span className="font-bold text-[#FF6A2A]">
                  Filtered for: {products.find((p) => p.id === historyFilterProduct)?.name || historyFilterProduct}
                </span>
                <button
                  onClick={() => setHistoryFilterProduct(null)}
                  className="text-xs text-muted-foreground hover:text-black underline cursor-pointer"
                >
                  Show all
                </button>
              </div>
            )}

            {/* Log List */}
            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 custom-scrollbar">
              {logs.filter((l) => !historyFilterProduct || l.productId === historyFilterProduct).length === 0 ? (
                <div className="py-12 text-center text-xs text-muted-foreground">
                  No inventory log events recorded yet.
                </div>
              ) : (
                logs
                  .filter((l) => !historyFilterProduct || l.productId === historyFilterProduct)
                  .map((log) => {
                    const isPositive = log.change > 0;
                    return (
                      <div
                        key={log.id}
                        className="flex items-center justify-between p-3 rounded-xl border border-black/5 bg-[#faf9f6] text-xs"
                      >
                        <div className="min-w-0 flex-1 pr-3">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-[#1a1917] truncate">{log.productName}</span>
                            {log.variantName && (
                              <span className="bg-black/5 px-1.5 py-0.2 rounded text-[10px] text-muted-foreground">
                                {log.variantName}
                              </span>
                            )}
                            <span
                              className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase ${
                                log.type === "sale"
                                  ? "bg-blue-100 text-blue-800"
                                  : log.type === "cancellation_restock" || log.type === "refund_restock"
                                  ? "bg-emerald-100 text-emerald-800"
                                  : "bg-purple-100 text-purple-800"
                              }`}
                            >
                              {log.type.replace("_", " ")}
                            </span>
                          </div>
                          <p className="text-[11px] text-muted-foreground mt-0.5 truncate">
                            {log.reason || (log.orderId ? `Order #${log.orderId}` : "Stock update")}
                            {" • "}
                            {log.createdAt ? new Date(log.createdAt).toLocaleString() : "Recently"}
                          </p>
                        </div>

                        <div className="text-right shrink-0">
                          <span
                            className={`font-black text-xs ${
                              isPositive ? "text-emerald-600" : log.change < 0 ? "text-red-600" : "text-gray-600"
                            }`}
                          >
                            {isPositive ? `+${log.change}` : log.change}
                          </span>
                          <p className="text-[10px] text-muted-foreground">
                            {log.previousStock} &rarr; <span className="font-bold text-[#1a1917]">{log.newStock}</span>
                          </p>
                        </div>
                      </div>
                    );
                  })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
