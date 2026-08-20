"use client";

import { useEffect, useState } from "react";
import { collection, getCountFromServer, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { 
  Package, 
  Tags, 
  FileText, 
  MessageSquare, 
  ImageIcon,
  TrendingUp,
  Users,
  ShoppingCart,
  Star
} from "lucide-react";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar
} from "recharts";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    products: 0,
    orders: 0,
    reviews: 0,
    blogs: 0,
    messages: 0,
  });
  const [productData, setProductData] = useState<{name: string, count: number}[]>([]);
  const [chartData, setChartData] = useState<{name: string, orders: number}[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Fetch static counts for stats that don't need full document sync
    async function fetchCounts() {
      try {
        const [
          blogsSnap,
          messagesSnap,
          reviewsSnap,
        ] = await Promise.all([
          getCountFromServer(collection(db, "blogs")),
          getCountFromServer(collection(db, "messages")),
          getCountFromServer(collection(db, "reviews")),
        ]);

        setStats(prev => ({
          ...prev,
          blogs: blogsSnap.data().count,
          messages: messagesSnap.data().count,
          reviews: reviewsSnap.data().count,
        }));
      } catch (error) {
        console.error("Error fetching counts:", error);
      }
    }
    fetchCounts();

    // 2. Real-time sync for Products (Category Spread) & Total Products count
    const unsubscribeProducts = onSnapshot(collection(db, "products"), (snapshot) => {
      const categoryCount: Record<string, number> = {};
      snapshot.docs.forEach((doc) => {
        const cat = doc.data().category || "Uncategorized";
        categoryCount[cat] = (categoryCount[cat] || 0) + 1;
      });

      const catData = Object.entries(categoryCount)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      setProductData(catData);
      setStats(prev => ({ ...prev, products: snapshot.size }));
    });

    // 3. Real-time sync for Orders & Total Orders count
    // Generate last 7 days names
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date();
    const last7Days = Array.from({length: 7}).map((_, i) => {
      const d = new Date();
      d.setDate(today.getDate() - (6 - i));
      return { name: days[d.getDay()], date: d, orders: 0 };
    });

    const unsubscribeOrders = onSnapshot(collection(db, "orders"), (snapshot) => {
      // Reset counts
      const updated7Days = last7Days.map(d => ({ ...d, orders: 0 }));

      snapshot.docs.forEach(doc => {
        const data = doc.data();
        if (data.createdAt) {
          const orderDate = data.createdAt.toDate ? data.createdAt.toDate() : new Date(data.createdAt);
          // Find if order is in last 7 days
          const dayMatch = updated7Days.find(d => 
            d.date.getDate() === orderDate.getDate() && 
            d.date.getMonth() === orderDate.getMonth()
          );
          if (dayMatch) {
            dayMatch.orders += 1;
          }
        }
      });

      setChartData(updated7Days);
      setStats(prev => ({ ...prev, orders: snapshot.size }));
      setLoading(false);
    });

    return () => {
      unsubscribeProducts();
      unsubscribeOrders();
    };
  }, []);

  const statCards = [
    { title: "Total Products", value: stats.products, icon: Package },
    { title: "Total Orders", value: stats.orders, icon: ShoppingCart },
    { title: "Reviews", value: stats.reviews, icon: Star },
    { title: "Blog Posts", value: stats.blogs, icon: FileText },
    { title: "New Messages", value: stats.messages, icon: MessageSquare },
  ];

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

      {/* Premium Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div 
              key={index} 
              className="relative overflow-hidden bg-gradient-to-br from-[#FF6A2A] to-[#FF8A50] p-6 rounded-3xl flex flex-col justify-between shadow-lg shadow-orange-500/20 group hover:-translate-y-1 transition-all duration-300"
            >
              {/* Decorative shapes */}
              <div className="absolute top-0 right-0 -mr-4 -mt-4 w-24 h-24 rounded-full bg-white/10 blur-2xl group-hover:bg-white/20 transition-colors" />
              <div className="absolute bottom-0 left-0 -ml-4 -mb-4 w-16 h-16 rounded-full bg-white/10 blur-xl group-hover:bg-white/20 transition-colors" />
              
              <div className="flex justify-between items-start mb-4 relative z-10">
                <div className="p-3 rounded-2xl bg-white/20 text-white backdrop-blur-sm group-hover:scale-110 transition-transform shadow-inner border border-white/20">
                  <Icon className="w-6 h-6" />
                </div>
              </div>
              <div className="relative z-10">
                <p className="text-orange-50 text-sm font-medium tracking-wide">{stat.title}</p>
                <h3 className="text-3xl font-black text-white mt-1 drop-shadow-md">
                  {loading ? "..." : stat.value}
                </h3>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <div className="bg-white border border-[#1a1917]/5 p-6 rounded-2xl lg:col-span-2 min-w-0">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-[#1a1917] flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-[#FF6A2A]" />
                Order Trends
              </h3>
              <p className="text-sm text-[#1a1917]/50">Weekly order metrics</p>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FF6A2A" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#FF6A2A" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(26,25,23,0.05)" vertical={false} />
                <XAxis dataKey="name" stroke="rgba(26,25,23,0.3)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="rgba(26,25,23,0.3)" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#ffffff', border: '1px solid rgba(26,25,23,0.1)', borderRadius: '12px' }}
                  itemStyle={{ color: '#1a1917' }}
                />
                <Area type="monotone" dataKey="orders" stroke="#FF6A2A" strokeWidth={3} fillOpacity={1} fill="url(#colorOrders)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Secondary Chart */}
        <div className="bg-white border border-[#1a1917]/5 p-6 rounded-2xl min-w-0">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-[#1a1917] flex items-center gap-2">
              <Package className="w-5 h-5 text-blue-400" />
              Category Spread
            </h3>
            <p className="text-sm text-[#1a1917]/50">Products per category</p>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={productData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(26,25,23,0.05)" vertical={false} />
                <XAxis dataKey="name" stroke="rgba(26,25,23,0.3)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="rgba(26,25,23,0.3)" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  cursor={{ fill: 'rgba(26,25,23,0.05)' }}
                  contentStyle={{ backgroundColor: '#ffffff', border: '1px solid rgba(26,25,23,0.1)', borderRadius: '12px' }}
                />
                <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
