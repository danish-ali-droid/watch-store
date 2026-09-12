import { useNavigate } from "react-router-dom";
import {
  Package,
  Truck,
  CheckCircle,
  Clock,
  XCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useStore, Order } from "../store/useStore";
import { useState, useEffect } from "react";

const formatPKR = (n: number) => "₨ " + n.toLocaleString("en-PK");

const statusConfig: Record<
  Order["status"],
  { icon: any; color: string; bg: string }
> = {
  Pending: { icon: Clock, color: "text-yellow-400", bg: "bg-yellow-500/20" },
  Processing: { icon: Package, color: "text-blue-400", bg: "bg-blue-500/20" },
  Shipped: { icon: Truck, color: "text-purple-400", bg: "bg-purple-500/20" },
  Delivered: {
    icon: CheckCircle,
    color: "text-green-400",
    bg: "bg-green-500/20",
  },
  Cancelled: { icon: XCircle, color: "text-red-400", bg: "bg-red-500/20" },
};

export default function OrdersPage() {
  const { orders, currentUser, isAuthenticated, fetchOrders } = useStore();
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      fetchOrders();
    }
  }, [isAuthenticated, fetchOrders]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-white text-xl mb-4">
            Please login to view your orders
          </p>
          <button
            onClick={() => navigate("/login")}
            className="bg-amber-500 text-gray-950 px-6 py-2 rounded-full"
          >
            Login
          </button>
        </div>
      </div>
    );
  }

  const myOrders =
    currentUser?.role === "admin"
      ? orders
      : orders.filter((o) => o.userId === currentUser?.id);

  const steps = ["Pending", "Processing", "Shipped", "Delivered"];

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="font-playfair text-3xl font-bold mb-8">
          {currentUser?.role === "admin" ? "All Orders" : "My Orders"}
        </h1>

        {myOrders.length === 0 ? (
          <div className="text-center py-20">
            <Package className="w-16 h-16 text-gray-700 mx-auto mb-4" />
            <p className="text-gray-400 text-lg mb-4">No orders yet</p>
            <button
              onClick={() => navigate("/products")}
              className="bg-amber-500 text-gray-950 px-6 py-2 rounded-full font-semibold hover:bg-amber-400"
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {myOrders
              .slice()
              .reverse()
              .map((order) => {
                const {
                  icon: StatusIcon,
                  color,
                  bg,
                } = statusConfig[order.status];
                const isOpen = expanded === order.id;
                const stepIdx = steps.indexOf(order.status);

                return (
                  <div
                    key={order.id}
                    className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden"
                  >
                    {/* Header */}
                    <button
                      onClick={() => setExpanded(isOpen ? null : order.id)}
                      className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-800/50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-10 h-10 ${bg} rounded-full flex items-center justify-center flex-shrink-0`}
                        >
                          <StatusIcon className={`w-5 h-5 ${color}`} />
                        </div>
                        <div>
                          <div className="flex items-center gap-3">
                            <span className="text-white font-mono font-semibold">
                              {order.id}
                            </span>
                            <span
                              className={`text-xs px-2 py-0.5 rounded-full ${bg} ${color} font-medium`}
                            >
                              {order.status}
                            </span>
                          </div>
                          <p className="text-gray-400 text-sm mt-0.5">
                            {new Date(order.createdAt).toLocaleDateString(
                              "en-PK",
                              {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              },
                            )}
                            {currentUser?.role === "admin" &&
                              ` • ${order.userName}`}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-amber-400 font-bold">
                            {formatPKR(Number(order.total))}
                          </p>
                          <p className="text-gray-500 text-xs">
                            {order.paymentMethod}
                          </p>
                        </div>
                        {isOpen ? (
                          <ChevronUp className="w-5 h-5 text-gray-400" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-400" />
                        )}
                      </div>
                    </button>

                    {/* Expanded */}
                    {isOpen && (
                      <div className="border-t border-gray-800 p-5">
                        {/* Progress Bar */}
                        {order.status !== "Cancelled" && (
                          <div className="mb-6">
                            <div className="flex items-center justify-between mb-2">
                              {steps.map((s, i) => (
                                <div key={s} className="flex items-center">
                                  <div
                                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium ${i <= stepIdx ? "bg-amber-500 text-gray-950" : "bg-gray-800 text-gray-500"}`}
                                  >
                                    {i < stepIdx ? "✓" : i + 1}
                                  </div>
                                  {i < steps.length - 1 && (
                                    <div
                                      className={`h-0.5 w-16 mx-1 ${i < stepIdx ? "bg-amber-500" : "bg-gray-700"}`}
                                    />
                                  )}
                                </div>
                              ))}
                            </div>
                            <div className="flex justify-between text-xs text-gray-500">
                              {steps.map((s) => (
                                <span key={s}>{s}</span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Items */}
                        <div className="space-y-3 mb-4">
                          {order.items?.map(({ watch, quantity }: any) => (
                            <div
                              key={watch.id}
                              className="flex gap-3 items-center bg-gray-800/50 rounded-lg p-3"
                            >
                              <img
                                src={watch.image}
                                alt={watch.name}
                                className="w-14 h-14 object-cover rounded-lg flex-shrink-0"
                              />
                              <div className="flex-1">
                                <p className="text-white text-sm font-medium">
                                  {watch.name}
                                </p>
                                <p className="text-gray-400 text-xs">
                                  {watch.brand} • Qty: {quantity}
                                </p>
                              </div>
                              <p className="text-amber-400 font-medium text-sm">
                                {formatPKR(watch.price * quantity)}
                              </p>
                            </div>
                          ))}
                        </div>

                        {/* Details */}
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div className="bg-gray-800/50 rounded-lg p-3">
                            <p className="text-gray-500 text-xs mb-1">
                              Shipping Address
                            </p>
                            <p className="text-white">
                              {order.shippingAddress}
                            </p>
                          </div>
                          <div className="bg-gray-800/50 rounded-lg p-3">
                            <p className="text-gray-500 text-xs mb-1">Phone</p>
                            <p className="text-white">{order.phone}</p>
                          </div>
                          {order.trackingNumber && (
                            <div className="bg-gray-800/50 rounded-lg p-3">
                              <p className="text-gray-500 text-xs mb-1">
                                Tracking Number
                              </p>
                              <p className="text-amber-400 font-mono">
                                {order.trackingNumber}
                              </p>
                            </div>
                          )}
                          <div className="bg-gray-800/50 rounded-lg p-3">
                            <p className="text-gray-500 text-xs mb-1">
                              Payment
                            </p>
                            <p className="text-white">
                              {order.paymentMethod === "COD"
                                ? "Cash on Delivery"
                                : "Card Payment"}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        )}
      </div>
    </div>
  );
}
