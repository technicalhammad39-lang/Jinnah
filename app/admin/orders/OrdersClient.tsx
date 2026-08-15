"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, updateDoc, deleteDoc, doc, query, orderBy } from "firebase/firestore";
import { 
  Eye, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  Truck,
  PackageCheck,
  Search,
  Filter,
  ArrowRight
} from "lucide-react";
import { getPublicUploadUrl } from "@/lib/utils";
import Image from "next/image";

type OrderItem = {
  product: any;
  quantity: number;
  selectedColor: string;
  selectedSize: string;
};

type Order = {
  dbKey: string;
  id: string;
  customerInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    postalCode: string;
    notes: string;
  };
  customerType?: string;
  paymentMethod: string;
  items: OrderItem[];
  subtotal: number;
  total: number;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  createdAt: string;
};

export default function OrdersClient() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/admin/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;

    const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const orderList = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          dbKey: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt,
        };
      }) as Order[];
      
      setOrders(orderList);
      setFilteredOrders(orderList);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    let result = orders;

    if (statusFilter !== "all") {
      result = result.filter(order => order.status === statusFilter);
    }

    if (searchTerm) {
      const lowerTerm = searchTerm.toLowerCase();
      result = result.filter(order => 
        order.id.toLowerCase().includes(lowerTerm) ||
        `${order.customerInfo.firstName} ${order.customerInfo.lastName}`.toLowerCase().includes(lowerTerm) ||
        order.customerInfo.phone.includes(lowerTerm)
      );
    }

    setFilteredOrders(result);
  }, [searchTerm, statusFilter, orders]);

  const updateOrderStatus = async (dbKey: string, newStatus: string) => {
    try {
      await updateDoc(doc(db, "orders", dbKey), { status: newStatus });
      if (selectedOrder?.dbKey === dbKey) {
        setSelectedOrder({ ...selectedOrder, status: newStatus as any });
      }
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update order status.");
    }
  };

  const deleteOrder = async (dbKey: string) => {
    if (!window.confirm("Are you sure you want to delete this order? This action cannot be undone.")) return;
    
    try {
      await deleteDoc(doc(db, "orders", dbKey));
      if (selectedOrder?.dbKey === dbKey) {
        setSelectedOrder(null);
      }
    } catch (error) {
      console.error("Error deleting order:", error);
      alert("Failed to delete order.");
    }
  };

  if (loading || isLoading) {
    return <div className="p-8 text-center">Loading orders...</div>;
  }

  if (!user) {
    return null; // Will redirect
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-800"><Clock className="h-3 w-3" /> Pending</span>;
      case "processing":
        return <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-800"><CheckCircle2 className="h-3 w-3" /> Processing</span>;
      case "shipped":
        return <span className="inline-flex items-center gap-1 rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-semibold text-purple-800"><Truck className="h-3 w-3" /> Shipped</span>;
      case "delivered":
        return <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800"><PackageCheck className="h-3 w-3" /> Delivered</span>;
      case "cancelled":
        return <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-800"><Trash2 className="h-3 w-3" /> Cancelled</span>;
      default:
        return <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-semibold text-gray-800">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-bold">Order Management</h1>
          <p className="text-sm text-muted-foreground">View and manage customer orders</p>
        </div>
      </div>

      <div className="flex flex-col gap-4 rounded-xl border border-black/5 bg-white p-4 shadow-sm md:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by Order ID, Name, or Phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-black/10 bg-black/5 py-2 pl-10 pr-4 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-black/10 bg-black/5 py-2 px-4 text-sm outline-none focus:border-primary"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Order List */}
        <div className="lg:col-span-2 space-y-4">
          {filteredOrders.length === 0 ? (
            <div className="rounded-xl border border-black/5 bg-white p-8 text-center text-muted-foreground">
              No orders found matching your criteria.
            </div>
          ) : (
            filteredOrders.map((order) => (
              <div 
                key={order.dbKey}
                onClick={() => setSelectedOrder(order)}
                className={`cursor-pointer rounded-xl border transition-all hover:border-primary/50 hover:shadow-md ${
                  selectedOrder?.dbKey === order.dbKey ? "border-primary bg-primary/5 shadow-md" : "border-black/5 bg-white"
                }`}
              >
                <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="font-bold text-foreground">Order #{order.id}</h3>
                      {getStatusBadge(order.status)}
                    </div>
                    <p className="mt-1 text-sm font-medium">
                      {order.customerInfo.firstName} {order.customerInfo.lastName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(order.createdAt).toLocaleString()} • {order.items?.length || 0} items
                    </p>
                  </div>
                  
                  <div className="flex items-center justify-between sm:flex-col sm:items-end sm:gap-2">
                    <span className="font-bold text-lg">Rs. {order.total?.toLocaleString() || 0}</span>
                    <button className="flex items-center gap-1 text-xs font-semibold text-primary hover:underline">
                      View Details <ArrowRight className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Order Details Panel */}
        <div className="lg:col-span-1">
          {selectedOrder ? (
            <div className="sticky top-28 rounded-xl border border-black/5 bg-white p-6 shadow-sm">
              <div className="mb-6 flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-bold">Order #{selectedOrder.id}</h2>
                  <p className="text-xs text-muted-foreground">{new Date(selectedOrder.createdAt).toLocaleString()}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <select
                    value={selectedOrder.status}
                    onChange={(e) => updateOrderStatus(selectedOrder.dbKey, e.target.value)}
                    className="rounded-lg border border-black/10 bg-black/5 py-1.5 px-3 text-sm font-semibold outline-none"
                  >
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                  <button 
                    onClick={() => deleteOrder(selectedOrder.dbKey)}
                    className="text-xs font-semibold text-red-500 hover:underline"
                  >
                    Delete Order
                  </button>
                </div>
              </div>

              <div className="mb-6 space-y-4 rounded-lg bg-black/5 p-4">
                <h3 className="font-bold text-sm uppercase tracking-wider text-muted-foreground">Customer Info</h3>
                <div>
                  <p className="font-semibold">{selectedOrder.customerInfo.firstName} {selectedOrder.customerInfo.lastName}</p>
                  <p className="text-sm">{selectedOrder.customerInfo.email}</p>
                  <p className="text-sm font-mono">{selectedOrder.customerInfo.phone}</p>
                  <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-black/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-black/70">
                    {selectedOrder.customerType === "account" ? "Account User" : "Guest Checkout"}
                  </div>
                </div>
                <div>
                  <p className="text-sm">{selectedOrder.customerInfo.address}</p>
                  <p className="text-sm">{selectedOrder.customerInfo.city}, {selectedOrder.customerInfo.postalCode}</p>
                </div>
                {selectedOrder.customerInfo.notes && (
                  <div className="rounded border border-black/10 bg-white p-2">
                    <p className="text-xs font-semibold text-muted-foreground">Notes:</p>
                    <p className="text-sm">{selectedOrder.customerInfo.notes}</p>
                  </div>
                )}
                <div className="pt-2 border-t border-black/10">
                  <p className="text-sm font-semibold text-muted-foreground">Payment Method: <span className="uppercase text-black">{selectedOrder.paymentMethod}</span></p>
                </div>
              </div>

              <div>
                <h3 className="mb-4 font-bold text-sm uppercase tracking-wider text-muted-foreground">Order Items</h3>
                <div className="max-h-[300px] space-y-4 overflow-y-auto pr-2">
                  {selectedOrder.items?.map((item, idx) => (
                    <div key={idx} className="flex gap-3">
                      <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded bg-[#efece6]">
                        <Image
                          src={item.product.images?.[0] ? getPublicUploadUrl(item.product.images[0]) : "/placeholder.jpg"}
                          alt={item.product.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="line-clamp-1 text-sm font-semibold">{item.product.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.quantity}x | {item.selectedSize} | <span style={{ backgroundColor: item.selectedColor }} className="inline-block h-2 w-2 rounded-full border border-black/20" />
                        </p>
                      </div>
                      <div className="text-sm font-bold">
                        Rs. {(item.product.price * item.quantity).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-6 space-y-2 border-t border-black/10 pt-4">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal</span>
                    <span>Rs. {selectedOrder.subtotal?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Shipping</span>
                    <span>Free</span>
                  </div>
                  <div className="flex justify-between text-lg font-extrabold pt-2 border-t border-black/10">
                    <span>Total</span>
                    <span>Rs. {selectedOrder.total?.toLocaleString()}</span>
                  </div>
                </div>
              </div>

            </div>
          ) : (
            <div className="sticky top-28 flex h-[400px] flex-col items-center justify-center rounded-xl border border-black/5 bg-black/5 p-6 text-center text-muted-foreground">
              <Eye className="mb-4 h-12 w-12 opacity-20" />
              <p>Select an order to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
