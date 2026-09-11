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
  ArrowRight,
  ExternalLink,
  Save,
  Navigation,
  RotateCcw
} from "lucide-react";
import { getPublicUploadUrl } from "@/lib/utils";
import Image from "next/image";
import { toast } from "sonner";

type OrderItem = {
  product: any;
  quantity: number;
  selectedColor: string;
  selectedSize: string;
};

type Order = {
  dbKey: string;
  id: string;
  trackingId?: string;
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
  items: any[];
  subtotal: number;
  discount?: number;
  appliedCoupon?: string | null;
  total: number;
  status: "pending" | "processing" | "shipped" | "out_for_delivery" | "delivered" | "cancelled" | "refunded";
  inventoryDeducted?: boolean;
  inventoryRestored?: boolean;
  courierName?: string | null;
  trackingNumber?: string | null;
  estimatedDelivery?: string | null;
  publicTrackingNotes?: string | null;
  transactionId?: string | null;
  paymentProof?: string | null;
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
  const [pendingRefundOrder, setPendingRefundOrder] = useState<Order | null>(null);
  const [returnToInventory, setReturnToInventory] = useState(true);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const [courierName, setCourierName] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [estimatedDelivery, setEstimatedDelivery] = useState("");
  const [publicTrackingNotes, setPublicTrackingNotes] = useState("");
  const [isSavingTracking, setIsSavingTracking] = useState(false);

  useEffect(() => {
    if (selectedOrder) {
      setCourierName(selectedOrder.courierName || "");
      setTrackingNumber(selectedOrder.trackingNumber || "");
      setEstimatedDelivery(selectedOrder.estimatedDelivery || "");
      setPublicTrackingNotes(selectedOrder.publicTrackingNotes || "");
    }
  }, [selectedOrder]);

  const saveTrackingDetails = async () => {
    if (!selectedOrder) return;
    setIsSavingTracking(true);
    try {
      await updateDoc(doc(db, "orders", selectedOrder.dbKey), {
        courierName: courierName.trim() || null,
        trackingNumber: trackingNumber.trim() || null,
        estimatedDelivery: estimatedDelivery.trim() || null,
        publicTrackingNotes: publicTrackingNotes.trim() || null,
      });

      setSelectedOrder({
        ...selectedOrder,
        courierName: courierName.trim() || null,
        trackingNumber: trackingNumber.trim() || null,
        estimatedDelivery: estimatedDelivery.trim() || null,
        publicTrackingNotes: publicTrackingNotes.trim() || null,
      });

      toast.success("Courier & tracking details updated.");
    } catch (err) {
      console.error("Failed to update tracking details:", err);
      toast.error("Failed to update tracking details.");
    } finally {
      setIsSavingTracking(false);
    }
  };

  useEffect(() => {
    if (!loading && !user) {
      router.push("/admin-cts/login");
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

  const updateOrderStatus = async (dbKey: string, newStatus: string, restoreInventoryOverride?: boolean) => {
    // If setting to refunded without explicit confirmation, prompt dialog
    if (newStatus === "refunded" && restoreInventoryOverride === undefined) {
      const orderToRefund = selectedOrder?.dbKey === dbKey ? selectedOrder : orders.find(o => o.dbKey === dbKey);
      if (orderToRefund) {
        setPendingRefundOrder(orderToRefund);
        setReturnToInventory(true);
        return;
      }
    }

    setIsUpdatingStatus(true);
    try {
      const res = await fetch("/api/admin/orders/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: dbKey,
          newStatus,
          restoreInventory: restoreInventoryOverride ?? false,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update order status");
      }

      const updatedOrder =
        selectedOrder?.dbKey === dbKey
          ? { ...selectedOrder, status: newStatus as any, inventoryRestored: data.inventoryRestored }
          : orders.find((o) => o.dbKey === dbKey);

      if (selectedOrder?.dbKey === dbKey) {
        setSelectedOrder({
          ...selectedOrder,
          status: newStatus as any,
          inventoryRestored: data.inventoryRestored,
        });
      }

      if (data.inventoryRestored) {
        toast.success(`Order marked as ${newStatus}. Inventory has been safely restored.`);
      } else {
        toast.success(`Order status updated to ${newStatus}.`);
      }

      // Dispatch automated transactional email via SMTP if configured
      if (updatedOrder) {
        fetch("/api/admin/email/order-event", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ order: updatedOrder, newStatus }),
        }).catch((err) => console.error("Email automation trigger failed:", err));
      }
    } catch (error: any) {
      console.error("Error updating status:", error);
      toast.error(error.message || "Failed to update order status.");
    } finally {
      setIsUpdatingStatus(false);
      setPendingRefundOrder(null);
    }
  };

  const deleteOrder = async (dbKey: string) => {
    if (!window.confirm("Are you sure you want to delete this order? This action cannot be undone.")) return;
    
    try {
      await deleteDoc(doc(db, "orders", dbKey));
      if (selectedOrder?.dbKey === dbKey) {
        setSelectedOrder(null);
      }
      toast.success("Order deleted successfully.");
    } catch (error) {
      console.error("Error deleting order:", error);
      toast.error("Failed to delete order.");
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
      case "out_for_delivery":
        return <span className="inline-flex items-center gap-1 rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-semibold text-indigo-800"><Navigation className="h-3 w-3" /> Out for Delivery</span>;
      case "delivered":
        return <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800"><PackageCheck className="h-3 w-3" /> Delivered</span>;
      case "cancelled":
        return <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-800"><Trash2 className="h-3 w-3" /> Cancelled</span>;
      case "refunded":
        return <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-semibold text-orange-800"><RotateCcw className="h-3 w-3" /> Refunded</span>;
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
            <option value="out_for_delivery">Out for Delivery</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
            <option value="refunded">Refunded</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-start">
        {/* Order List (5/12) */}
        <div className="lg:col-span-5 xl:col-span-5 space-y-3.5">
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
                <div className="flex flex-col gap-3 p-4 sm:p-5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-foreground text-sm sm:text-base">Order #{order.id}</h3>
                        {order.trackingId && (
                          <span className="font-mono text-[11px] font-extrabold text-primary bg-primary/10 px-1.5 py-0.5 rounded border border-primary/20">
                            {order.trackingId}
                          </span>
                        )}
                        {getStatusBadge(order.status)}
                      </div>
                      <p className="mt-1 text-xs sm:text-sm font-medium text-gray-800 truncate">
                        {order.customerInfo.firstName} {order.customerInfo.lastName}
                      </p>
                      <p className="text-[11px] sm:text-xs text-muted-foreground mt-0.5">
                        {new Date(order.createdAt).toLocaleString()} • {order.items?.length || 0} items
                      </p>
                    </div>
                    
                    <div className="text-right shrink-0">
                      <span className="font-extrabold text-base sm:text-lg block text-gray-900">
                        Rs. {order.total?.toLocaleString() || 0}
                      </span>
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-primary hover:underline mt-1">
                        View Details <ArrowRight className="h-3 w-3" />
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Order Details Panel (7/12) */}
        <div className="lg:col-span-7 xl:col-span-7">
          {selectedOrder ? (
            <div className="rounded-xl border border-black/5 bg-white p-6 sm:p-7 shadow-sm">
              <div className="mb-6 flex items-start justify-between">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold">Order #{selectedOrder.id}</h2>
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
                    <option value="out_for_delivery">Out for Delivery</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="refunded">Refunded</option>
                  </select>
                  <button 
                    onClick={() => deleteOrder(selectedOrder.dbKey)}
                    className="text-xs font-semibold text-red-500 hover:underline"
                  >
                    Delete Order
                  </button>
                </div>
              </div>

              {/* Logistics & Courier Controls */}
              <div className="mb-6 space-y-3 rounded-lg border border-primary/25 bg-primary/5 p-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-xs uppercase tracking-wider text-primary flex items-center gap-1.5">
                    <Truck className="h-4 w-4" /> Logistics & Courier
                  </h3>
                  <a
                    href={`/track-order/${selectedOrder.trackingId || selectedOrder.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-primary hover:underline"
                  >
                    <span>View Portal</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>

                <div className="space-y-2.5 pt-1">
                  <div>
                    <label className="block text-[11px] font-semibold text-muted-foreground mb-1">
                      Courier Company
                    </label>
                    <select
                      value={courierName}
                      onChange={(e) => setCourierName(e.target.value)}
                      className="w-full rounded-md border border-black/10 bg-white py-1.5 px-2.5 text-xs font-medium outline-none focus:border-primary"
                    >
                      <option value="">Select Courier Partner</option>
                      <option value="PostEx">PostEx Express</option>
                      <option value="TCS">TCS Express</option>
                      <option value="Leopards">Leopards Courier</option>
                      <option value="Trax">Trax Logistics</option>
                      <option value="Rider">Rider</option>
                      <option value="Call Courier">Call Courier</option>
                      <option value="M&P">M&P Logistics</option>
                      <option value="Jinnah Express">Jinnah Express (In-House)</option>
                      <option value="Other">Other Courier</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-muted-foreground mb-1">
                      Consignment / Tracking # (CN)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. PX-98213891 or 127839219"
                      value={trackingNumber}
                      onChange={(e) => setTrackingNumber(e.target.value)}
                      className="w-full rounded-md border border-black/10 bg-white py-1.5 px-2.5 text-xs font-mono outline-none focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-muted-foreground mb-1">
                      Estimated Delivery
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 2-3 Working Days or Tomorrow by 5PM"
                      value={estimatedDelivery}
                      onChange={(e) => setEstimatedDelivery(e.target.value)}
                      className="w-full rounded-md border border-black/10 bg-white py-1.5 px-2.5 text-xs outline-none focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-muted-foreground mb-1">
                      Public Customer Note
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Dispatched via express van"
                      value={publicTrackingNotes}
                      onChange={(e) => setPublicTrackingNotes(e.target.value)}
                      className="w-full rounded-md border border-black/10 bg-white py-1.5 px-2.5 text-xs outline-none focus:border-primary"
                    />
                  </div>

                  <button
                    onClick={saveTrackingDetails}
                    disabled={isSavingTracking}
                    className="mt-1 flex w-full items-center justify-center gap-1.5 rounded-md bg-primary py-2 text-xs font-bold text-white shadow-sm transition-all hover:bg-primary/95 disabled:opacity-60 cursor-pointer"
                  >
                    <Save className="h-3.5 w-3.5" />
                    <span>{isSavingTracking ? "Saving..." : "Save Logistics Info"}</span>
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
                <div className="pt-2.5 border-t border-black/10 space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-muted-foreground">
                      Payment Method: <span className="uppercase font-bold text-black">{selectedOrder.paymentMethod}</span>
                    </p>
                    {selectedOrder.transactionId && (
                      <p className="text-xs font-mono font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">
                        TID: {selectedOrder.transactionId}
                      </p>
                    )}
                  </div>

                  {selectedOrder.paymentProof && (
                    <div className="p-3 rounded-xl bg-white border border-black/10 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-emerald-800 flex items-center gap-1">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                          Payment Receipt Attached
                        </span>
                        <a
                          href={selectedOrder.paymentProof}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-primary font-bold hover:underline"
                        >
                          View Full Image
                        </a>
                      </div>
                      <div className="relative h-48 w-full rounded-lg overflow-hidden border border-black/10 bg-black/5">
                        <Image
                          src={selectedOrder.paymentProof}
                          alt="Payment Receipt"
                          fill
                          className="object-contain p-1"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h3 className="mb-4 font-bold text-sm uppercase tracking-wider text-muted-foreground">Order Items</h3>
                <div className="space-y-3.5">
                  {selectedOrder.items?.map((item: any, idx: number) => {
                    const itemName = item.product?.name || item.name;
                    const itemImage = item.product?.images?.[0] || item.image;
                    const itemPrice = item.product?.price || item.price;
                    
                    return (
                      <div key={idx} className="flex gap-3">
                        <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded bg-[#efece6]">
                          <Image
                            src={itemImage ? getPublicUploadUrl(itemImage) : "/placeholder.jpg"}
                            alt={itemName || "Product"}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="line-clamp-1 text-sm font-semibold">{itemName}</p>
                          <p className="text-xs text-muted-foreground">
                            {item.quantity}x | {item.selectedSize} 
                            {item.selectedColor && <span style={{ backgroundColor: item.selectedColor }} className="inline-block h-2 w-2 rounded-full border border-black/20 ml-1" />}
                          </p>
                        </div>
                        <div className="text-sm font-bold">
                          Rs. {(itemPrice * item.quantity).toLocaleString()}
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                <div className="mt-6 space-y-2 border-t border-black/10 pt-4">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal</span>
                    <span>Rs. {selectedOrder.subtotal?.toLocaleString()}</span>
                  </div>
                  {selectedOrder.discount && selectedOrder.discount > 0 && (
                    <div className="flex justify-between text-sm text-emerald-600 font-medium">
                      <span>Discount {selectedOrder.appliedCoupon ? `(${selectedOrder.appliedCoupon})` : ''}</span>
                      <span>- Rs. {selectedOrder.discount.toLocaleString()}</span>
                    </div>
                  )}
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

      {/* Refund Confirmation Modal */}
      {pendingRefundOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl space-y-5 border border-black/10">
            <div className="flex items-center gap-3 border-b border-black/5 pb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/10 text-[#FF6A2A]">
                <RotateCcw className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-[#1a1917]">Refund Order #{pendingRefundOrder.id}</h3>
                <p className="text-xs text-muted-foreground">Confirm order refund and inventory action</p>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-sm text-[#1a1917]/80">
                You are about to mark this order of <span className="font-bold">Rs. {pendingRefundOrder.total?.toLocaleString()}</span> as refunded.
              </p>

              <label className="flex items-start gap-3 p-3.5 rounded-xl border border-black/10 bg-[#faf9f6] cursor-pointer hover:bg-black/5 transition-colors">
                <input
                  type="checkbox"
                  checked={returnToInventory}
                  onChange={(e) => setReturnToInventory(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded text-[#FF6A2A] focus:ring-[#FF6A2A]"
                />
                <div className="text-xs">
                  <span className="font-bold text-[#1a1917] block">Return items to inventory</span>
                  <span className="text-muted-foreground">
                    Automatically restore the ordered quantities back to product stock.
                  </span>
                </div>
              </label>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setPendingRefundOrder(null)}
                disabled={isUpdatingStatus}
                className="px-4 py-2 text-xs font-bold text-muted-foreground hover:bg-black/5 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => updateOrderStatus(pendingRefundOrder.dbKey, "refunded", returnToInventory)}
                disabled={isUpdatingStatus}
                className="px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white bg-[#FF6A2A] hover:bg-[#e5591c] rounded-xl shadow-md transition-colors"
              >
                {isUpdatingStatus ? "Processing..." : "Confirm Refund"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
