"use client";

import { useEffect, useState } from "react";
import { collection, getCountFromServer } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { 
  Package, 
  Tags, 
  FileText, 
  MessageSquare, 
  ImageIcon,
  TrendingUp,
  Users
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

// Mock data for charts until we build full analytics
const visitorData = [
  { name: 'Mon', visitors: 400 },
  { name: 'Tue', visitors: 300 },
  { name: 'Wed', visitors: 550 },
  { name: 'Thu', visitors: 450 },
  { name: 'Fri', visitors: 700 },
  { name: 'Sat', visitors: 650 },
  { name: 'Sun', visitors: 800 },
];

const productData = [
  { name: 'Locks', count: 120 },
  { name: 'Handles', count: 85 },
  { name: 'Hinges', count: 200 },
  { name: 'Smart', count: 45 },
];

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    products: 0,
    brands: 0,
    blogs: 0,
    messages: 0,
    gallery: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const [
          productsSnap,
          brandsSnap,
          blogsSnap,
          messagesSnap,
          gallerySnap
        ] = await Promise.all([
          getCountFromServer(collection(db, "products")),
          getCountFromServer(collection(db, "brands")),
          getCountFromServer(collection(db, "blogs")),
          getCountFromServer(collection(db, "messages")),
          getCountFromServer(collection(db, "gallery"))
        ]);

        setStats({
          products: productsSnap.data().count,
          brands: brandsSnap.data().count,
          blogs: blogsSnap.data().count,
          messages: messagesSnap.data().count,
          gallery: gallerySnap.data().count
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  const statCards = [
    { title: "Total Products", value: stats.products, icon: Package, color: "text-blue-400", bg: "bg-blue-400/10" },
    { title: "Total Brands", value: stats.brands, icon: Tags, color: "text-purple-400", bg: "bg-purple-400/10" },
    { title: "Blog Posts", value: stats.blogs, icon: FileText, color: "text-green-400", bg: "bg-green-400/10" },
    { title: "New Messages", value: stats.messages, icon: MessageSquare, color: "text-yellow-400", bg: "bg-yellow-400/10" },
    { title: "Gallery Images", value: stats.gallery, icon: ImageIcon, color: "text-pink-400", bg: "bg-pink-400/10" },
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

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div 
              key={index} 
              className="bg-white border border-[#1a1917]/5 p-6 rounded-2xl flex flex-col justify-between hover:border-[#1a1917]/10 transition-colors group"
            >
              <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <div>
                <p className="text-[#1a1917]/50 text-sm font-medium">{stat.title}</p>
                <h3 className="text-3xl font-black text-[#1a1917] mt-1">
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
        <div className="bg-white border border-[#1a1917]/5 p-6 rounded-2xl lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-[#1a1917] flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-[#FF6A2A]" />
                Content Growth
              </h3>
              <p className="text-sm text-[#1a1917]/50">Weekly engagement metrics</p>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={visitorData}>
                <defs>
                  <linearGradient id="colorVisitors" x1="0" y1="0" x2="0" y2="1">
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
                <Area type="monotone" dataKey="visitors" stroke="#FF6A2A" strokeWidth={3} fillOpacity={1} fill="url(#colorVisitors)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Secondary Chart */}
        <div className="bg-white border border-[#1a1917]/5 p-6 rounded-2xl">
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
