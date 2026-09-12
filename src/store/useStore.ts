import { create } from "zustand";
import { persist } from "zustand/middleware";
import toast from "react-hot-toast";

export interface Watch {
  id: number;
  name: string;
  brand: string;
  price: number;
  originalPrice?: number;
  category: "Luxury" | "Sports" | "Smart";
  image: string;
  images: string[];
  movement: string;
  waterResistance: string;
  caseMaterial: string;
  warranty: string;
  caseSize: string;
  description: string;
  stock: number;
  rating: number;
  reviews: number;
  featured: boolean;
  new: boolean;
}

export interface CartItem {
  watch: Watch;
  quantity: number;
}

export interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  role: "user" | "admin";
  createdAt: string;
}

export interface Order {
  id: string;
  userId: number;
  userName: string;
  items: CartItem[];
  total: number;
  status: "Pending" | "Processing" | "Shipped" | "Delivered" | "Cancelled";
  paymentMethod: "COD" | "Card";
  shippingAddress: string;
  phone: string;
  createdAt: string;
  trackingNumber?: string;
}

export interface DailySalesReportItem {
  date: string;
  revenue: number;
  orders: number;
  items: number;
  soldWatches: Array<{ name: string; quantity: number; unitPrice: number }>;
}

const buildDailySalesReportFromOrders = (orderList: Order[]) => {
  const grouped = orderList.reduce<
    Record<
      string,
      {
        revenue: number;
        orders: number;
        items: number;
        soldMap: Record<
          string,
          { name: string; quantity: number; unitPrice: number }
        >;
      }
    >
  >(
    (acc, order) => {
      if (order.status === "Cancelled") return acc;

      const createdAt = order.createdAt
        ? new Date(order.createdAt)
        : new Date();
      const dateKey = Number.isNaN(createdAt.getTime())
        ? "unknown"
        : createdAt.toISOString().split("T")[0];

      if (!acc[dateKey]) {
        acc[dateKey] = { revenue: 0, orders: 0, items: 0, soldMap: {} };
      }

      acc[dateKey].revenue += Number(order.total || 0);
      acc[dateKey].orders += 1;
      acc[dateKey].items += (order.items || []).reduce(
        (sum, item) => sum + (item.quantity || 0),
        0,
      );

      // Aggregate sold watches per day
      for (const it of order.items || []) {
        const name = it.watch?.name || "Unknown";
        const qty = Number(it.quantity || 0);
        const unit =
          Number(it.watch?.price || 0) || Number((it as any).unitPrice || 0);
        if (!acc[dateKey].soldMap[name]) {
          acc[dateKey].soldMap[name] = { name, quantity: qty, unitPrice: unit };
        } else {
          acc[dateKey].soldMap[name].quantity += qty;
          // keep unitPrice as-is (assume consistent pricing)
        }
      }

      return acc;
    },
    {} as Record<
      string,
      {
        revenue: number;
        orders: number;
        items: number;
        soldMap: Record<
          string,
          { name: string; quantity: number; unitPrice: number }
        >;
      }
    >,
  );

  return Object.entries(grouped)
    .map(([date, data]) => ({
      date,
      revenue: data.revenue,
      orders: data.orders,
      items: data.items,
      soldWatches: Object.values(data.soldMap || {}).map((v) => ({
        name: v.name,
        quantity: v.quantity,
        unitPrice: v.unitPrice,
      })),
    }))
    .sort((a, b) => b.date.localeCompare(a.date));
};

interface StoreState {
  // Auth
  currentUser: User | null;
  users: User[];
  isAuthenticated: boolean;
  pendingOtp: {
    email?: string;
    phone?: string;
    otp: string;
    type: "register" | "order";
    data?: any;
  } | null;

  // Cart
  cart: CartItem[];

  // Data
  watches: Watch[];
  orders: Order[];
  dailySalesReport: DailySalesReportItem[];

  // Filters
  searchQuery: string;
  selectedBrand: string;
  selectedCategory: string;
  priceRange: [number, number];

  // Actions
  login: (
    email: string,
    password: string,
  ) => Promise<{ success: boolean; message: string }>;
  register: (data: any) => Promise<{ success: boolean; message: string }>;
  verifyRegisterOtp: (
    otp: string,
  ) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => void;

  requestPasswordReset: (
    email: string,
  ) => Promise<{ success: boolean; message: string }>;
  resetPassword: (
    email: string,
    otp: string,
    newPassword: string,
  ) => Promise<{ success: boolean; message: string }>;

  fetchWatches: () => Promise<void>;
  fetchOrders: () => Promise<void>;
  fetchDailySalesReport: () => Promise<void>;
  fetchUsers: () => Promise<void>;

  addToCart: (watch: Watch) => void;
  removeFromCart: (watchId: number) => void;
  updateQuantity: (watchId: number, qty: number) => void;
  clearCart: () => void;

  placeOrder: (
    orderData: any,
  ) => Promise<{ success: boolean; message: string }>;
  verifyOrderOtp: (
    otp: string,
  ) => Promise<{ success: boolean; orderId?: string; message: string }>;
  deleteOrder: (orderId: string) => Promise<void>;

  updateOrderStatus: (orderId: string, status: Order["status"]) => void;
  setSearchQuery: (q: string) => void;
  setSelectedBrand: (b: string) => void;
  setSelectedCategory: (c: string) => void;
  setPriceRange: (r: [number, number]) => void;

  // Admin
  addProduct: (formData: FormData) => Promise<void>;
  updateProduct: (id: number, formData: FormData) => Promise<void>;
  deleteProduct: (id: number) => Promise<void>;
  deleteUser: (id: number) => Promise<void>;
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      currentUser: null,
      users: [],
      isAuthenticated: false,
      pendingOtp: null,
      cart: [],
      watches: [],
      orders: [],
      dailySalesReport: [],
      searchQuery: "",
      selectedBrand: "",
      selectedCategory: "",
      priceRange: [0, 10000000],

      fetchWatches: async () => {
        try {
          const response = await fetch("/api/products");
          const data = await response.json();
          if (response.ok) set({ watches: data });
        } catch (error) {
          console.error("Fetch watches error:", error);
        }
      },

      fetchOrders: async () => {
        const { currentUser } = get();
        if (!currentUser) return;
        try {
          const url =
            currentUser.role === "admin"
              ? "/api/orders"
              : `/api/orders?userId=${currentUser.id}`;
          const response = await fetch(url);
          const data = await response.json();
          if (response.ok) {
            set({ orders: data });
            get().fetchDailySalesReport();
          }
        } catch (error) {
          console.error("Fetch orders error:", error);
        }
      },

      fetchDailySalesReport: async () => {
        const { orders } = get();
        try {
          const response = await fetch("/api/orders/sales-report");
          const data = await response.json();
          if (response.ok) {
            set({ dailySalesReport: data });
            return;
          }
        } catch (error) {
          console.error("Fetch daily sales report error:", error);
        }

        set({ dailySalesReport: buildDailySalesReportFromOrders(orders) });
      },

      fetchUsers: async () => {
        try {
          const response = await fetch("/api/users");
          const data = await response.json();
          if (response.ok) set({ users: data });
        } catch (error) {
          console.error("Fetch users error:", error);
        }
      },

      requestPasswordReset: async (email: string) => {
        try {
          const response = await fetch("/api/auth/forgot-password-otp", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email }),
          });
          const result = await response.json();
          return {
            success: response.ok,
            message: result.message || result.error,
          };
        } catch (error) {
          return { success: false, message: "Network error." };
        }
      },

      resetPassword: async (email, otp, newPassword) => {
        try {
          const response = await fetch("/api/auth/reset-password", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, otp, newPassword }),
          });
          const result = await response.json();
          return {
            success: response.ok,
            message: result.message || result.error,
          };
        } catch (error) {
          return { success: false, message: "Network error." };
        }
      },

      login: async (email, password) => {
        try {
          const response = await fetch("/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
          });
          const result = await response.json();
          if (response.ok) {
            set({ currentUser: result, isAuthenticated: true });
            get().fetchOrders();
            get().fetchWatches();
            return { success: true, message: "Login successful!" };
          } else {
            return { success: false, message: result.error };
          }
        } catch (error) {
          return {
            success: false,
            message: "Network error. Please try again.",
          };
        }
      },

      register: async (data) => {
        try {
          const response = await fetch("/api/auth/register-otp", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
          });
          const result = await response.json();
          if (response.ok) {
            set({
              pendingOtp: {
                email: data.email,
                otp: result.otp || "",
                type: "register",
                data,
              },
            });
            return { success: true, message: result.message };
          } else {
            return { success: false, message: result.error };
          }
        } catch (error) {
          return {
            success: false,
            message: "Network error. Please try again.",
          };
        }
      },

      verifyRegisterOtp: async (otp) => {
        const { pendingOtp } = get();
        if (!pendingOtp || pendingOtp.type !== "register")
          return { success: false, message: "No pending registration." };
        try {
          const response = await fetch("/api/auth/register-verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: pendingOtp.email, otp }),
          });
          const result = await response.json();
          if (response.ok) {
            set({
              currentUser: result,
              isAuthenticated: true,
              pendingOtp: null,
            });
            get().fetchWatches();
            return { success: true, message: "Account created successfully!" };
          } else {
            return { success: false, message: result.error };
          }
        } catch (error) {
          return { success: false, message: "Network error." };
        }
      },

      logout: () =>
        set({ currentUser: null, isAuthenticated: false, cart: [] }),

      updateProfile: (data) => {
        const { currentUser } = get();
        if (!currentUser) return;
        set({ currentUser: { ...currentUser, ...data } });
      },

      addToCart: (watch) => {
        const { cart } = get();
        const existing = cart.find((i) => i.watch.id === watch.id);
        if (existing) {
          set({
            cart: cart.map((i) =>
              i.watch.id === watch.id ? { ...i, quantity: i.quantity + 1 } : i,
            ),
          });
        } else {
          set({ cart: [...cart, { watch, quantity: 1 }] });
        }
      },

      removeFromCart: (watchId) =>
        set({ cart: get().cart.filter((i) => i.watch.id !== watchId) }),

      updateQuantity: (watchId, qty) => {
        if (qty <= 0) {
          get().removeFromCart(watchId);
          return;
        }
        set({
          cart: get().cart.map((i) =>
            i.watch.id === watchId ? { ...i, quantity: qty } : i,
          ),
        });
      },

      clearCart: () => set({ cart: [] }),

      placeOrder: async (orderData) => {
        const { currentUser } = get();
        if (!currentUser)
          return { success: false, message: "Please login first." };
        try {
          const response = await fetch("/api/orders/request-otp", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              phone: orderData.phone || currentUser.phone,
              userId: currentUser.id,
            }),
          });
          const result = await response.json();
          if (response.ok) {
            set({
              pendingOtp: {
                email: currentUser.email,
                phone: orderData.phone || currentUser.phone,
                otp: result.otp || "",
                type: "order",
                data: orderData,
              },
            });
            return { success: true, message: result.message };
          } else {
            return { success: false, message: result.error };
          }
        } catch (error) {
          return { success: false, message: "Network error." };
        }
      },

      verifyOrderOtp: async (otp) => {
        const { pendingOtp, currentUser, cart } = get();
        if (!pendingOtp || pendingOtp.type !== "order")
          return { success: false, message: "No pending order." };
        try {
          const orderData = {
            ...pendingOtp.data,
            userId: currentUser!.id,
            items: cart.map((item: any) => ({
              watchId: item.watch.id,
              quantity: item.quantity,
              unitPrice: item.watch.price,
            })),
          };
          const response = await fetch("/api/orders/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: pendingOtp.email, otp, orderData }),
          });
          const result = await response.json();
          if (response.ok) {
            set({ cart: [], pendingOtp: null });
            await get().fetchOrders();
            return {
              success: true,
              orderId: result.orderId,
              message: result.message,
            };
          } else {
            return {
              success: false,
              message: result.error || "Verification failed.",
            };
          }
        } catch (error) {
          return { success: false, message: "Network error." };
        }
      },

      updateOrderStatus: async (orderId, status) => {
        if (!orderId) {
          toast.error("Invalid Order ID");
          return;
        }
        try {
          const response = await fetch("/api/orders/update-status", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: orderId, status }),
          });

          if (response.ok) {
            set({
              orders: get().orders.map((o) =>
                o.id === orderId ? { ...o, status } : o,
              ),
            });
            toast.success(`Order status updated to ${status}`);
          } else {
            const result = await response.json();
            toast.error(`Failed: ${result.error || response.statusText}`);
          }
        } catch (error) {
          console.error("Update status error:", error);
          toast.error("Network error. Check server connection.");
        }
      },

      deleteOrder: async (orderId: string) => {
        try {
          const response = await fetch(`/api/orders/${orderId}`, {
            method: "DELETE",
          });
          if (response.ok) {
            set({ orders: get().orders.filter((o) => o.id !== orderId) });
            toast.success("Order deleted successfully.");
          } else {
            const result = await response.json();
            toast.error(result.error || "Failed to delete order.");
          }
        } catch (error) {
          toast.error("Network error deleting order.");
        }
      },

      setSearchQuery: (q) => set({ searchQuery: q }),
      setSelectedBrand: (b) => set({ selectedBrand: b }),
      setSelectedCategory: (c) => set({ selectedCategory: c }),
      setPriceRange: (r) => set({ priceRange: r }),

      addProduct: async (formData: FormData) => {
        try {
          const response = await fetch("/api/products", {
            method: "POST",
            body: formData,
          });
          if (response.ok) {
            await get().fetchWatches();
          } else {
            const result = await response.json();
            toast.error(result.error || "Failed to add product.");
          }
        } catch (error) {
          toast.error("Network error adding product.");
        }
      },

      updateProduct: async (id: number, formData: FormData) => {
        try {
          const response = await fetch(`/api/products/${id}`, {
            method: "PUT",
            body: formData,
          });
          if (response.ok) {
            await get().fetchWatches();
          } else {
            const result = await response.json();
            toast.error(result.error || "Failed to update product.");
          }
        } catch (error) {
          toast.error("Network error updating product.");
        }
      },

      deleteProduct: async (id: number) => {
        try {
          const response = await fetch(`/api/products/${id}`, {
            method: "DELETE",
          });
          if (response.ok) {
            // Remove from local state immediately, then confirm with a fresh fetch
            set({ watches: get().watches.filter((w) => w.id !== id) });
            await get().fetchWatches();
          } else {
            const result = await response.json();
            toast.error(result.error || "Failed to delete product.");
          }
        } catch (error) {
          toast.error("Network error deleting product.");
        }
      },

      deleteUser: async (id: number) => {
        try {
          const response = await fetch(`/api/users/${id}`, {
            method: "DELETE",
          });
          if (response.ok) {
            set({ users: get().users.filter((u) => u.id !== id) });
            toast.success("User deleted.");
          } else {
            const result = await response.json();
            toast.error(result.error || "Failed to delete user.");
          }
        } catch (error) {
          toast.error("Network error deleting user.");
        }
      },
    }),
    {
      name: "chronolux-store",
      partialize: (state) => ({
        cart: state.cart,
        currentUser: state.currentUser,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
