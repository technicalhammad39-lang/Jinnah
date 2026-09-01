"use client";

import { useEffect, useState } from "react";
import { collection, getCountFromServer, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Package, FileText, MessageSquare, TrendingUp, ShoppingCart, Star, ChevronDown } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from "recharts";

type TrendMetric = "orders" | "revenue" | "products_sold" | "new_customers";
type CatMetric = "products" | "orders" | "units_sold" | "revenue";

const TREND_OPTIONS = [
  { value: "orders" as TrendMetric, label: "Orders" },
  { value: "revenue" as TrendMetric, label: "Revenue (Rs.)" },
  { value: "products_sold" as TrendMetric, label: "Products Sold" },
  { value: "new_customers" as TrendMetric, label: "New Customers" },
];

const CAT_OPTIONS = [
  { value: "products" as CatMetric, label: "Products" },
  { value: "orders" as CatMetric, label: "Orders" },
  { value: "units_sold" as CatMetric, label: "Units Sold" },
  { value: "revenue" as CatMetric, label: "Revenue (Rs.)" },
];

const COLORS = ["#FF6A2A", "#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899"];

function buildLast7Days() {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const today = new Date();
  return Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(today.getDate() - (6 - i));
    return { label: days[d.getDay()], date: d };
  });
}

function computeTrend(orders: any[], metric: TrendMetric) {
  const days = buildLast7Days();
  const result = days.map(d => ({ name: d.label, value: 0, date: d.date }));
  orders.forEach(order => {
    if (!order.createdAt) return;
    const od = order.createdAt.toDate ? order.createdAt.toDate() : new Date(order.createdAt);
    const m = result.find(r => r.date.getDate() === od.getDate() && r.date.getMonth() === od.getMonth() && r.date.getFullYear() === od.getFullYear());
    if (!m) return;
    if (metric === "orders") m.value += 1;
    else if (metric === "revenue") m.value += order.total || 0;
    else if (metric === "products_sold") m.value += (order.items || []).reduce((s: number, it: any) => s + (it.quantity || 1), 0);
    else if (metric === "new_customers") m.value += 1;
  });
  return result.map(r => ({ name: r.name, value: Math.round(r.value) }));
}

function computeCatData(products: any[], orders: any[], metric: CatMetric) {
  if (metric === "products") {
    const counts: Record<string, number> = {};
    products.forEach(p => { const c = (p.category || "Uncategorized").slice(0, 13); counts[c] = (counts[c] || 0) + 1; });
    return Object.entries(counts).map(([n, v]) => ({ name: n, value: v })).sort((a, b) => b.value - a.value).slice(0, 6);
  }
  const agg: Record<string, number> = {};
  orders.forEach(order => {
    (order.items || []).forEach((item: any) => {
      const cat = (item.product?.category || item.category || products.find((p: any) => p.id === item.product?.id)?.category || "Uncategorized").slice(0, 13);
      if (metric === "orders") agg[cat] = (agg[cat] || 0) + 1;
      else if (metric === "units_sold") agg[cat] = (agg[cat] || 0) + (item.quantity || 1);
      else if (metric === "revenue") agg[cat] = (agg[cat] || 0) + ((item.quantity || 1) * (item.product?.price || 0));
    });
  });
  return Object.entries(agg).map(([n, v]) => ({ name: n, value: Math.round(v) })).sort((a, b) => b.value - a.value).slice(0, 6);
}

export default function AdminDashboard() {
  const [stats, setStats] = useState({ products: 0, orders: 0, reviews: 0, blogs: 0, messages: 0 });
  const [loading, setLoading] = useState(true);
  const [trendMetric, setTrendMetric] = useState<TrendMetric>("orders");
  const [trendData, setTrendData] = useState<{ name: string; value: number }[]>([]);
  const [trendOpen, setTrendOpen] = useState(false);
  const [catMetric, setCatMetric] = useState<CatMetric>("products");
  const [catData, setCatData] = useState<{ name: string; value: number }[]>([]);
  const [catOpen, setCatOpen] = useState(false);
  const [rawOrders, setRawOrders] = useState<any[]>([]);
  const [rawProducts, setRawProducts] = useState<any[]>([]);

  useEffect(() => {
    async function fetchCounts() {
      try {
        const [b, m, r] = await Promise.all([
          getCountFromServer(collection(db, "blogs")),
          getCountFromServer(collection(db, "messages")),
          getCountFromServer(collection(db, "reviews")),
        ]);
        setStats(p => ({ ...p, blogs: b.data().count, messages: m.data().count, reviews: r.data().count }));
      } catch {}
    }
    fetchCounts();
    const u1 = onSnapshot(collection(db, "products"), snap => {
      setRawProducts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setStats(p => ({ ...p, products: snap.size }));
    });
    const u2 = onSnapshot(collection(db, "orders"), snap => {
      setRawOrders(snap.docs.map(d => d.data()));
      setStats(p => ({ ...p, orders: snap.size }));
      setLoading(false);
    });
    return () => { u1(); u2(); };
  }, []);

  useEffect(() => { setTrendData(computeTrend(rawOrders, trendMetric)); }, [rawOrders, trendMetric]);
  useEffect(() => { setCatData(computeCatData(rawProducts, rawOrders, catMetric)); }, [rawProducts, rawOrders, catMetric]);

  const statCards = [
    { title: "Total Products", value: stats.products, icon: Package },
    { title: "Total Orders", value: stats.orders, icon: ShoppingCart },
    { title: "Reviews", value: stats.reviews, icon: Star },
    { title: "Blog Posts", value: stats.blogs, icon: FileText },
    { title: "Messages", value: stats.messages, icon: MessageSquare },
  ];
  const trendLabel = TREND_OPTIONS.find(o => o.value === trendMetric)?.label ?? "Orders";
  const catLabel = CAT_OPTIONS.find(o => o.value === catMetric)?.label ?? "Products";

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#1a1917]">Overview</h1>
          <p className="text-[#1a1917]/50 text-sm mt-1">Welcome to your Jinnah Hardware CMS.</p>
        </div>
        <div className="flex items-center gap-2 bg-white border border-[#1a1917]/5 px-4 py-2 rounded-xl">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-sm font-medium text-[#1a1917]/70">System Online</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {statCards.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="relative overflow-hidden bg-gradient-to-br from-[#FF6A2A] to-[#FF8A50] p-6 rounded-3xl flex flex-col justify-between shadow-lg shadow-orange-500/20 group hover:-translate-y-1 transition-all duration-300">
              <div className="absolute top-0 right-0 -mr-4 -mt-4 w-24 h-24 rounded-full bg-white/10 blur-2xl" />
              <div className="flex justify-between items-start mb-4 relative z-10">
                <div className="p-3 rounded-2xl bg-white/20 text-white backdrop-blur-sm group-hover:scale-110 transition-transform">
                  <Icon className="w-6 h-6" />
                </div>
              </div>
              <div className="relative z-10">
                <p className="text-orange-50 text-sm font-medium">{stat.title}</p>
                <h3 className="text-3xl font-black text-white mt-1">{loading ? "..." : stat.value}</h3>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white border border-[#1a1917]/5 p-6 rounded-2xl lg:col-span-2 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-6 gap-3">
            <div>
              <h3 className="text-lg font-bold text-[#1a1917] flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-[#FF6A2A]" />
                Order Trends
              </h3>
              <p className="text-sm text-[#1a1917]/50">Last 7 days — {trendLabel}</p>
            </div>
            <div className="relative">
              <button onClick={() => setTrendOpen(o => !o)} className="flex items-center gap-2 px-4 py-2 bg-[#1a1917]/5 hover:bg-[#1a1917]/10 rounded-xl text-sm font-bold text-[#1a1917] transition-colors whitespace-nowrap">
                {trendLabel} <ChevronDown className={`w-4 h-4 transition-transform ${trendOpen ? "rotate-180" : ""}`} />
              </button>
              {trendOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-[#1a1917]/5 z-50 overflow-hidden">
                  {TREND_OPTIONS.map(opt => (
                    <button key={opt.value} onClick={() => { setTrendMetric(opt.value); setTrendOpen(false); }}
                      className={`w-full text-left px-4 py-3 text-sm font-medium hover:bg-[#FF6A2A]/5 ${trendMetric === opt.value ? "text-[#FF6A2A] font-bold" : "text-[#1a1917]/70"}`}>
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="h-[280px] w-full">
            {trendData.every(d => d.value === 0) ? (
              <div className="h-full flex items-center justify-center">
                <div className="text-center text-[#1a1917]/30">
                  <TrendingUp className="w-12 h-12 mx-auto mb-3 opacity-20" />
                  <p className="text-sm font-medium">No {trendLabel} data this week</p>
                </div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient id="colorTrend" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#FF6A2A" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#FF6A2A" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(26,25,23,0.05)" vertical={false} />
                  <XAxis dataKey="name" stroke="rgba(26,25,23,0.3)" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="rgba(26,25,23,0.3)" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: "#fff", border: "1px solid rgba(26,25,23,0.1)", borderRadius: "12px" }}
                    formatter={(v: any) => [trendMetric === "revenue" ? `Rs. ${Number(v).toLocaleString()}` : v, trendLabel]} />
                  <Area type="monotone" dataKey="value" stroke="#FF6A2A" strokeWidth={3} fillOpacity={1} fill="url(#colorTrend)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="bg-white border border-[#1a1917]/5 p-6 rounded-2xl min-w-0">
          <div className="mb-4">
            <h3 className="text-lg font-bold text-[#1a1917] flex items-center gap-2 mb-3">
              <Package className="w-5 h-5 text-blue-400" />
              Category Performance
            </h3>
            <div className="relative">
              <button onClick={() => setCatOpen(o => !o)} className="flex items-center justify-between gap-2 px-4 py-2 bg-[#1a1917]/5 hover:bg-[#1a1917]/10 rounded-xl text-sm font-bold text-[#1a1917] transition-colors w-full">
                <span>{catLabel}</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${catOpen ? "rotate-180" : ""}`} />
              </button>
              {catOpen && (
                <div className="absolute left-0 top-full mt-2 w-full bg-white rounded-xl shadow-xl border border-[#1a1917]/5 z-50 overflow-hidden">
                  {CAT_OPTIONS.map(opt => (
                    <button key={opt.value} onClick={() => { setCatMetric(opt.value); setCatOpen(false); }}
                      className={`w-full text-left px-4 py-3 text-sm font-medium hover:bg-blue-50 ${catMetric === opt.value ? "text-blue-600 font-bold" : "text-[#1a1917]/70"}`}>
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <p className="text-xs text-[#1a1917]/40 mt-2">By category — {catLabel}</p>
          </div>
          <div className="h-[260px] w-full">
            {catData.length === 0 ? (
              <div className="h-full flex items-center justify-center">
                <div className="text-center text-[#1a1917]/30">
                  <Package className="w-12 h-12 mx-auto mb-3 opacity-20" />
                  <p className="text-sm font-medium">No data available</p>
                </div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={catData} layout="vertical" margin={{ left: 0, right: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(26,25,23,0.05)" horizontal={false} />
                  <XAxis type="number" stroke="rgba(26,25,23,0.3)" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis type="category" dataKey="name" stroke="rgba(26,25,23,0.3)" fontSize={10} tickLine={false} axisLine={false} width={75} />
                  <Tooltip cursor={{ fill: "rgba(26,25,23,0.05)" }} contentStyle={{ backgroundColor: "#fff", border: "1px solid rgba(26,25,23,0.1)", borderRadius: "12px" }}
                    formatter={(v: any) => [catMetric === "revenue" ? `Rs. ${Number(v).toLocaleString()}` : v, catLabel]} />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                    {catData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
