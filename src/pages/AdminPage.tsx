import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  TrendingUp,
  Plus,
  Edit,
  Trash2,
  AlertTriangle,
  CheckCircle,
  X,
  Save,
  Eye,
} from "lucide-react";
import { useStore, Watch, Order } from "../store/useStore";
import toast from "react-hot-toast";

const formatPKR = (n: number) => "₨ " + n.toLocaleString("en-PK");

const buildDailySalesReportFromOrders = (orderList: Order[]) => {
  const grouped = orderList.reduce<
    Record<
      string,
      {
        revenue: number;
        orders: number;
        items: number;
        soldWatches: Array<{
          name: string;
          quantity: number;
          unitPrice: number;
        }>;
      }
    >
  >((acc, order) => {
    if (order.status === "Cancelled") return acc;

    const createdAt = order.createdAt ? new Date(order.createdAt) : new Date();
    const dateKey = Number.isNaN(createdAt.getTime())
      ? "unknown"
      : createdAt.toISOString().split("T")[0];

    if (!acc[dateKey]) {
      acc[dateKey] = { revenue: 0, orders: 0, items: 0, soldWatches: [] };
    }

    acc[dateKey].revenue += Number(order.total || 0);
    acc[dateKey].orders += 1;
    acc[dateKey].items += (order.items || []).reduce(
      (sum, item) => sum + (item.quantity || 0),
      0,
    );
    acc[dateKey].soldWatches.push(
      ...(order.items || []).map((item) => ({
        name: item.watch.name,
        quantity: item.quantity,
        unitPrice: Number(item.watch.price || 0),
      })),
    );

    return acc;
  }, {});

  return Object.entries(grouped)
    .map(([date, data]) => ({ date, ...data }))
    .sort((a, b) => b.date.localeCompare(a.date));
};

const statusColors: Record<Order["status"], string> = {
  Pending: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  Processing: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  Shipped: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  Delivered: "bg-green-500/20 text-green-400 border-green-500/30",
  Cancelled: "bg-red-500/20 text-red-400 border-red-500/30",
};

type Tab = "dashboard" | "products" | "orders" | "users" | "reports";

export default function AdminPage() {
  const {
    currentUser,
    watches,
    orders,
    users,
    dailySalesReport,
    updateOrderStatus,
    deleteOrder,
    addProduct,
    updateProduct,
    deleteProduct,
    deleteUser,
    isAuthenticated,
    fetchOrders,
    fetchWatches,
    fetchUsers,
    fetchDailySalesReport,
  } = useStore();

  useEffect(() => {
    fetchOrders();
    fetchWatches();
    fetchUsers();
    fetchDailySalesReport();
  }, [fetchOrders, fetchWatches, fetchUsers, fetchDailySalesReport]);
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("dashboard");
  const [editingProduct, setEditingProduct] = useState<Watch | null>(null);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [selectedDay, setSelectedDay] = useState<any | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [productForm, setProductForm] = useState<Partial<Watch>>({
    name: "",
    brand: "",
    price: 0,
    category: "Luxury",
    movement: "",
    waterResistance: "",
    caseMaterial: "",
    warranty: "",
    caseSize: "",
    description: "",
    stock: 0,
    rating: 4.5,
    reviews: 0,
    featured: false,
    new: true,
    image: "/assets/pexels-190819.jpeg",
    images: ["/assets/pexels-190819.jpeg"],
  });

  if (!isAuthenticated || currentUser?.role !== "admin") {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <p className="text-white text-xl mb-2">Access Denied</p>
          <p className="text-gray-400 mb-4">Admin privileges required</p>
          <button
            onClick={() => navigate("/")}
            className="bg-amber-500 text-gray-950 px-6 py-2 rounded-full"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  const successfulOrders = orders.filter((o) => o.status !== "Cancelled");
  const totalRevenue = successfulOrders.reduce(
    (s, o) => s + Number(o.total),
    0,
  );
  const totalOrders = successfulOrders.length;
  const fallbackDailyReport = buildDailySalesReportFromOrders(orders);
  const visibleDailySalesReport =
    dailySalesReport.length > 0 ? dailySalesReport : fallbackDailyReport;
  const reportRevenue = visibleDailySalesReport.reduce(
    (sum, day) => sum + day.revenue,
    0,
  );
  const reportOrders = visibleDailySalesReport.reduce(
    (sum, day) => sum + day.orders,
    0,
  );
  const lowStock = watches.filter((w) => w.stock <= 5);
  const outOfStock = watches.filter((w) => w.stock === 0);

  const handleSaveProduct = async () => {
    if (!productForm.name || !productForm.brand || !productForm.price) {
      toast.error("Please fill required fields");
      return;
    }

    const formData = new FormData();
    const fields = [
      "name",
      "brand",
      "price",
      "originalPrice",
      "category",
      "movement",
      "waterResistance",
      "caseMaterial",
      "warranty",
      "caseSize",
      "description",
      "stock",
      "rating",
      "reviews",
    ] as const;

    fields.forEach((field) => {
      const value = productForm[field as keyof Watch];
      if (value !== undefined && value !== null) {
        formData.append(field, String(value));
      }
    });

    formData.append("featured", String(!!productForm.featured));
    formData.append("isNew", String(!!productForm.new));

    if (imageFile) {
      formData.append("image", imageFile);
    } else if (productForm.image) {
      formData.append("image", productForm.image);
    }

    if (productForm.images && productForm.images.length > 0) {
      formData.append("images", JSON.stringify(productForm.images));
    }

    if (editingProduct) {
      await updateProduct(editingProduct.id, formData);
      toast.success("Product updated!");
    } else {
      await addProduct(formData);
      toast.success("Product added!");
    }

    setEditingProduct(null);
    setShowAddProduct(false);
    setImageFile(null);
    setProductForm({
      name: "",
      brand: "",
      price: 0,
      category: "Luxury",
      movement: "",
      waterResistance: "",
      caseMaterial: "",
      warranty: "",
      caseSize: "",
      description: "",
      stock: 0,
      rating: 4.5,
      reviews: 0,
      featured: false,
      new: true,
      image: "/assets/pexels-8968349.jpeg",
      images: [],
    });
  };

  const handleEdit = (w: Watch) => {
    setEditingProduct(w);
    setProductForm(w);
    setShowAddProduct(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm("Delete this product?")) {
      await deleteProduct(id);
      toast.success("Product deleted!");
    }
  };

  const handleDeleteUser = async (id: number) => {
    if (id === currentUser.id) {
      toast.error("Cannot delete yourself!");
      return;
    }
    if (confirm("Delete this user?")) {
      await deleteUser(id);
    }
  };

  const tabs: { key: Tab; label: string; icon: any }[] = [
    { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { key: "products", label: "Products", icon: Package },
    { key: "orders", label: "Orders", icon: ShoppingBag },
    { key: "users", label: "Users", icon: Users },
    { key: "reports", label: "Reports", icon: TrendingUp },
  ];

  return (
    <div className="min-h-screen bg-gray-950 text-white flex">
      {/* Sidebar */}
      <aside className="w-56 bg-gray-900 border-r border-gray-800 flex flex-col py-6 px-3 hidden lg:flex">
        <div className="mb-6 px-3">
          <p className="text-amber-400 font-bold text-sm">Admin Panel</p>
          <p className="text-gray-500 text-xs mt-0.5">{currentUser.name}</p>
        </div>
        {tabs.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm mb-1 transition-colors ${tab === key ? "bg-amber-500 text-gray-950 font-medium" : "text-gray-400 hover:bg-gray-800 hover:text-white"}`}
          >
            <Icon className="w-4 h-4" /> {label}
          </button>
        ))}
        <div className="mt-auto">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-3 px-3 py-2.5 text-gray-500 hover:text-white text-sm w-full"
          >
            ← Back to Store
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 overflow-auto">
        {/* Mobile Tabs */}
        <div className="lg:hidden flex gap-2 p-4 border-b border-gray-800 overflow-x-auto">
          {tabs.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-medium ${tab === key ? "bg-amber-500 text-gray-950" : "bg-gray-800 text-gray-300"}`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Dashboard */}
        {tab === "dashboard" && (
          <div>
            <h2 className="font-playfair text-2xl font-bold mb-6">
              Dashboard Overview
            </h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {[
                {
                  label: "Total Revenue",
                  value: formatPKR(totalRevenue),
                  icon: TrendingUp,
                  color: "text-green-400",
                  bg: "bg-green-500/20",
                },
                {
                  label: "Total Orders",
                  value: totalOrders,
                  icon: ShoppingBag,
                  color: "text-blue-400",
                  bg: "bg-blue-500/20",
                },
                {
                  label: "Products",
                  value: watches.length,
                  icon: Package,
                  color: "text-amber-400",
                  bg: "bg-amber-500/20",
                },
                {
                  label: "Registered Users",
                  value: users.length,
                  icon: Users,
                  color: "text-purple-400",
                  bg: "bg-purple-500/20",
                },
              ].map(({ label, value, icon: Icon, color, bg }) => (
                <div
                  key={label}
                  className="bg-gray-900 rounded-xl p-5 border border-gray-800"
                >
                  <div
                    className={`w-10 h-10 ${bg} rounded-full flex items-center justify-center mb-3`}
                  >
                    <Icon className={`w-5 h-5 ${color}`} />
                  </div>
                  <p className={`text-xl font-bold ${color}`}>{value}</p>
                  <p className="text-gray-400 text-sm mt-1">{label}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <div className="bg-gray-900 rounded-xl border border-gray-800 p-5">
                <h3 className="text-white font-semibold mb-4">Order Status</h3>
                {(
                  [
                    "Pending",
                    "Processing",
                    "Shipped",
                    "Delivered",
                    "Cancelled",
                  ] as Order["status"][]
                ).map((status) => {
                  const count = orders.filter(
                    (o) => o.status === status,
                  ).length;
                  const pct = totalOrders
                    ? Math.round((count / totalOrders) * 100)
                    : 0;
                  return (
                    <div key={status} className="flex items-center gap-3 mb-3">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full border w-24 text-center ${statusColors[status]}`}
                      >
                        {status}
                      </span>
                      <div className="flex-1 bg-gray-800 rounded-full h-2">
                        <div
                          className="bg-amber-500 h-2 rounded-full"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-gray-400 text-sm w-6 text-right">
                        {count}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="bg-gray-900 rounded-xl border border-gray-800 p-5">
                <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-400" /> Stock
                  Alerts
                </h3>
                {outOfStock.length === 0 && lowStock.length === 0 ? (
                  <div className="flex items-center gap-2 text-green-400">
                    <CheckCircle className="w-5 h-5" />
                    <span className="text-sm">All products well stocked</span>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {outOfStock.map((w) => (
                      <div
                        key={w.id}
                        className="flex items-center justify-between bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2"
                      >
                        <span className="text-sm text-white truncate">
                          {w.name}
                        </span>
                        <span className="text-red-400 text-xs font-medium ml-2">
                          OUT OF STOCK
                        </span>
                      </div>
                    ))}
                    {lowStock
                      .filter((w) => w.stock > 0)
                      .map((w) => (
                        <div
                          key={w.id}
                          className="flex items-center justify-between bg-yellow-500/10 border border-yellow-500/20 rounded-lg px-3 py-2"
                        >
                          <span className="text-sm text-white truncate">
                            {w.name}
                          </span>
                          <span className="text-yellow-400 text-xs font-medium ml-2">
                            Only {w.stock} left
                          </span>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Reports */}
        {tab === "reports" && (
          <div>
            <h2 className="font-playfair text-2xl font-bold mb-6">Reports</h2>
            <div className="bg-gray-900 rounded-xl border border-gray-800 p-5 mb-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
                <div>
                  <h3 className="text-white font-semibold">
                    Daily Sales Report
                  </h3>
                  <p className="text-gray-400 text-sm">
                    Watch purchases grouped by day with the purchase date
                  </p>
                </div>
                <div className="text-left sm:text-right">
                  <p className="text-amber-400 text-lg font-semibold">
                    {formatPKR(reportRevenue)}
                  </p>
                  <p className="text-gray-400 text-sm">
                    {reportOrders} completed sales
                  </p>
                </div>
              </div>
              <div className="space-y-3">
                {visibleDailySalesReport.length > 0 ? (
                  visibleDailySalesReport.slice(0, 10).map((day) => (
                    <div
                      key={day.date}
                      onClick={() => setSelectedDay(day)}
                      className="rounded-lg border border-gray-800 bg-gray-800/60 px-3 py-3 cursor-pointer hover:bg-gray-800/70"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-white text-sm">
                            {new Date(day.date).toLocaleDateString("en-PK", {
                              weekday: "short",
                              day: "numeric",
                              month: "short",
                            })}
                          </p>
                          <p className="text-gray-400 text-xs">
                            {day.orders} orders • {day.items} items sold
                          </p>
                        </div>
                        <p className="text-amber-400 font-semibold">
                          {formatPKR(day.revenue)}
                        </p>
                      </div>
                      <div className="mt-2 text-xs text-gray-400">
                        <span className="font-medium text-gray-300">
                          Watches sold:
                        </span>{" "}
                        {day.soldWatches && day.soldWatches.length > 0
                          ? day.soldWatches
                              .map((item) => `${item.name} ×${item.quantity}`)
                              .join(", ")
                          : "No watch details"}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-gray-400">
                    No purchase activity yet.
                  </div>
                )}
              </div>
            </div>

            {/* Day details modal */}
            {selectedDay && (
              <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
                <div className="bg-gray-900 rounded-2xl border border-gray-700 p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-white font-semibold">
                        Sales for{" "}
                        {new Date(selectedDay.date).toLocaleDateString(
                          "en-PK",
                          {
                            weekday: "long",
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          },
                        )}
                      </h3>
                      <p className="text-gray-400 text-sm">
                        {selectedDay.orders} orders • {selectedDay.items} items
                      </p>
                    </div>
                    <button
                      onClick={() => setSelectedDay(null)}
                      className="text-gray-400 hover:text-white"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="bg-gray-800 rounded-lg p-3">
                    {selectedDay.soldWatches &&
                    selectedDay.soldWatches.length > 0 ? (
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="text-gray-400 border-b border-gray-700">
                            <th className="text-left pb-2">Watch</th>
                            <th className="text-right pb-2">Qty</th>
                            <th className="text-right pb-2">Unit</th>
                            <th className="text-right pb-2">Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedDay.soldWatches.map((w: any, i: number) => (
                            <tr key={i} className="border-b border-gray-800">
                              <td className="py-2 text-white">{w.name}</td>
                              <td className="py-2 text-right text-gray-300">
                                {w.quantity}
                              </td>
                              <td className="py-2 text-right text-gray-300">
                                {formatPKR(Number(w.unitPrice || 0))}
                              </td>
                              <td className="py-2 text-right text-amber-400 font-medium">
                                {formatPKR(
                                  Number(w.unitPrice || 0) *
                                    Number(w.quantity || 0),
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr>
                            <td className="pt-3 text-gray-300 font-medium">
                              Total
                            </td>
                            <td />
                            <td />
                            <td className="pt-3 text-amber-400 font-semibold text-right">
                              {formatPKR(
                                (selectedDay.soldWatches || []).reduce(
                                  (s: number, it: any) =>
                                    s +
                                    Number(it.unitPrice || 0) *
                                      Number(it.quantity || 0),
                                  0,
                                ),
                              )}
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    ) : (
                      <div className="text-gray-400">
                        No watch sale details available for this day.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Recent Orders */}
            <div className="bg-gray-900 rounded-xl border border-gray-800 p-5">
              <h3 className="text-white font-semibold mb-4">Recent Orders</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-gray-500 border-b border-gray-800">
                      <th className="text-left pb-3">Order ID</th>
                      <th className="text-left pb-3">Customer</th>
                      <th className="text-left pb-3">Amount</th>
                      <th className="text-left pb-3">Status</th>
                      <th className="text-left pb-3">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders
                      .slice(-5)
                      .reverse()
                      .map((o) => (
                        <tr key={o.id} className="border-b border-gray-800/50">
                          <td className="py-3 font-mono text-amber-400">
                            {o.id}
                          </td>
                          <td className="py-3 text-white">{o.userName}</td>
                          <td className="py-3 text-white">
                            {formatPKR(o.total)}
                          </td>
                          <td className="py-3">
                            <span
                              className={`text-xs px-2 py-0.5 rounded-full border ${statusColors[o.status]}`}
                            >
                              {o.status}
                            </span>
                          </td>
                          <td className="py-3 text-gray-400">{o.createdAt}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Products */}
        {tab === "products" && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-playfair text-2xl font-bold">
                Product Management
              </h2>
              <button
                onClick={() => {
                  setEditingProduct(null);
                  setShowAddProduct(true);
                }}
                className="flex items-center gap-2 bg-amber-500 text-gray-950 px-4 py-2 rounded-xl font-medium hover:bg-amber-400 text-sm"
              >
                <Plus className="w-4 h-4" /> Add Product
              </button>
            </div>

            {/* Add/Edit Modal */}
            {showAddProduct && (
              <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
                <div className="bg-gray-900 rounded-2xl border border-gray-700 p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="font-bold text-white text-lg">
                      {editingProduct ? "Edit Product" : "Add New Product"}
                    </h3>
                    <button
                      onClick={() => {
                        setShowAddProduct(false);
                        setEditingProduct(null);
                      }}
                      className="text-gray-400 hover:text-white"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      {
                        key: "name",
                        label: "Product Name *",
                        placeholder: "Rolex Submariner",
                        type: "text",
                      },
                      {
                        key: "brand",
                        label: "Brand *",
                        placeholder: "Rolex",
                        type: "text",
                      },
                      {
                        key: "price",
                        label: "Price (PKR) *",
                        placeholder: "2850000",
                        type: "number",
                      },
                      {
                        key: "originalPrice",
                        label: "Original Price",
                        placeholder: "3200000",
                        type: "number",
                      },
                      {
                        key: "stock",
                        label: "Stock Quantity *",
                        placeholder: "10",
                        type: "number",
                      },
                      {
                        key: "caseSize",
                        label: "Case Size",
                        placeholder: "41mm",
                        type: "text",
                      },
                      {
                        key: "movement",
                        label: "Movement",
                        placeholder: "Automatic",
                        type: "text",
                      },
                      {
                        key: "waterResistance",
                        label: "Water Resistance",
                        placeholder: "300m",
                        type: "text",
                      },
                      {
                        key: "caseMaterial",
                        label: "Case Material",
                        placeholder: "Stainless Steel",
                        type: "text",
                      },
                      {
                        key: "warranty",
                        label: "Warranty",
                        placeholder: "2 Years",
                        type: "text",
                      },
                    ].map(({ key, label, placeholder, type }) => (
                      <div key={key}>
                        <label className="text-gray-400 text-xs mb-1 block">
                          {label}
                        </label>
                        <input
                          type={type}
                          value={
                            (productForm[key as keyof Watch] as string) || ""
                          }
                          onChange={(e) =>
                            setProductForm((f) => ({
                              ...f,
                              [key]:
                                type === "number"
                                  ? +e.target.value
                                  : e.target.value,
                            }))
                          }
                          className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm outline-none focus:border-amber-500"
                          placeholder={placeholder}
                        />
                      </div>
                    ))}
                    <div>
                      <label className="text-gray-400 text-xs mb-1 block">
                        Category *
                      </label>
                      <select
                        value={productForm.category || "Luxury"}
                        onChange={(e) =>
                          setProductForm((f) => ({
                            ...f,
                            category: e.target.value as Watch["category"],
                          }))
                        }
                        className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm outline-none focus:border-amber-500"
                      >
                        {["Luxury", "Sports", "Smart"].map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-gray-400 text-xs mb-1 block">
                        Rating
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="5"
                        step="0.1"
                        value={productForm.rating || 4.5}
                        onChange={(e) =>
                          setProductForm((f) => ({
                            ...f,
                            rating: +e.target.value,
                          }))
                        }
                        className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm outline-none focus:border-amber-500"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="text-gray-400 text-xs mb-1 block">
                        Image URL
                      </label>
                      <input
                        value={productForm.image || ""}
                        onChange={(e) =>
                          setProductForm((f) => ({
                            ...f,
                            image: e.target.value,
                            images: [e.target.value],
                          }))
                        }
                        className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm outline-none focus:border-amber-500"
                        placeholder="https://..."
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="text-gray-400 text-xs mb-1 block">
                        Upload Product Image
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0] || null;
                          setImageFile(file);
                          if (file) {
                            const previewUrl = URL.createObjectURL(file);
                            setProductForm((f) => ({
                              ...f,
                              image: previewUrl,
                              images: [previewUrl],
                            }));
                          }
                        }}
                        className="w-full text-sm text-gray-200 file:bg-amber-500 file:text-gray-950 file:px-3 file:py-2 file:rounded-lg bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 outline-none"
                      />
                      {imageFile && (
                        <p className="text-gray-400 text-xs mt-1">
                          Selected file: {imageFile.name}
                        </p>
                      )}
                    </div>
                    <div className="col-span-2">
                      <label className="text-gray-400 text-xs mb-1 block">
                        Description
                      </label>
                      <textarea
                        value={productForm.description || ""}
                        onChange={(e) =>
                          setProductForm((f) => ({
                            ...f,
                            description: e.target.value,
                          }))
                        }
                        className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm outline-none focus:border-amber-500 resize-none"
                        rows={3}
                        placeholder="Product description..."
                      />
                    </div>
                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={!!productForm.featured}
                          onChange={(e) =>
                            setProductForm((f) => ({
                              ...f,
                              featured: e.target.checked,
                            }))
                          }
                          className="accent-amber-500"
                        />
                        <span className="text-gray-400 text-sm">Featured</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={!!productForm.new}
                          onChange={(e) =>
                            setProductForm((f) => ({
                              ...f,
                              new: e.target.checked,
                            }))
                          }
                          className="accent-amber-500"
                        />
                        <span className="text-gray-400 text-sm">
                          New Arrival
                        </span>
                      </label>
                    </div>
                  </div>
                  <div className="flex gap-3 mt-5">
                    <button
                      onClick={() => {
                        setShowAddProduct(false);
                        setEditingProduct(null);
                      }}
                      className="flex-1 border border-gray-700 text-white py-2.5 rounded-xl hover:bg-gray-800 text-sm"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveProduct}
                      className="flex-1 bg-amber-500 text-gray-950 py-2.5 rounded-xl font-semibold hover:bg-amber-400 flex items-center justify-center gap-2 text-sm"
                    >
                      <Save className="w-4 h-4" />{" "}
                      {editingProduct ? "Update" : "Add"} Product
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Products Table */}
            <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-800">
                    <tr className="text-gray-400">
                      <th className="text-left px-4 py-3">Product</th>
                      <th className="text-left px-4 py-3">Brand</th>
                      <th className="text-left px-4 py-3">Category</th>
                      <th className="text-left px-4 py-3">Price</th>
                      <th className="text-left px-4 py-3">Stock</th>
                      <th className="text-left px-4 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {watches.map((w) => (
                      <tr
                        key={w.id}
                        className="border-t border-gray-800 hover:bg-gray-800/30"
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <img
                              src={w.image}
                              alt={w.name}
                              className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                            />
                            <span className="text-white text-sm line-clamp-1 max-w-[150px]">
                              {w.name}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-400">{w.brand}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full ${w.category === "Luxury" ? "bg-amber-500/20 text-amber-400" : w.category === "Sports" ? "bg-blue-500/20 text-blue-400" : "bg-purple-500/20 text-purple-400"}`}
                          >
                            {w.category}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-amber-400 font-medium">
                          {formatPKR(w.price)}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`text-sm font-medium ${w.stock === 0 ? "text-red-400" : w.stock <= 5 ? "text-yellow-400" : "text-green-400"}`}
                          >
                            {w.stock === 0 ? "Out of Stock" : w.stock}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <button
                              onClick={() => navigate(`/product/${w.id}`)}
                              className="p-1.5 text-gray-400 hover:text-white transition-colors"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleEdit(w)}
                              className="p-1.5 text-blue-400 hover:text-blue-300 transition-colors"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(w.id)}
                              className="p-1.5 text-red-400 hover:text-red-300 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Orders */}
        {tab === "orders" && (
          <div>
            <h2 className="font-playfair text-2xl font-bold mb-6">
              Order Management
            </h2>
            <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-800">
                    <tr className="text-gray-400">
                      <th className="text-left px-4 py-3">Order ID</th>
                      <th className="text-left px-4 py-3">Customer</th>
                      <th className="text-left px-4 py-3">Items</th>
                      <th className="text-left px-4 py-3">Total</th>
                      <th className="text-left px-4 py-3">Payment</th>
                      <th className="text-left px-4 py-3">Status</th>
                      <th className="text-left px-4 py-3">Date</th>
                      <th className="text-left px-4 py-3">Update</th>
                      <th className="text-left px-4 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders
                      .slice()
                      .reverse()
                      .map((o) => (
                        <tr
                          key={o.id}
                          className="border-t border-gray-800 hover:bg-gray-800/30"
                        >
                          <td className="px-4 py-3 font-mono text-amber-400 text-xs">
                            {o.id}
                          </td>
                          <td className="px-4 py-3">
                            <p className="text-white">{o.userName}</p>
                            <p className="text-gray-500 text-xs">{o.phone}</p>
                          </td>
                          <td className="px-4 py-3 text-gray-400">
                            {(o.items || []).reduce(
                              (s, i) => s + i.quantity,
                              0,
                            )}{" "}
                            items
                          </td>
                          <td className="px-4 py-3 text-white font-medium">
                            {formatPKR(Number(o.total))}
                          </td>
                          <td className="px-4 py-3 text-gray-400">
                            {o.paymentMethod}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`text-xs px-2 py-0.5 rounded-full border ${statusColors[o.status]}`}
                            >
                              {o.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-gray-400 text-xs">
                            {o.createdAt}
                          </td>
                          <td className="px-4 py-3">
                            <select
                              value={o.status}
                              onChange={(e) => {
                                updateOrderStatus(
                                  o.id,
                                  e.target.value as Order["status"],
                                );
                                toast.success("Status updated!");
                              }}
                              className="bg-gray-800 border border-gray-700 text-white text-xs rounded-lg px-2 py-1 outline-none"
                            >
                              {[
                                "Pending",
                                "Processing",
                                "Shipped",
                                "Delivered",
                                "Cancelled",
                              ].map((s) => (
                                <option key={s} value={s}>
                                  {s}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="px-4 py-3">
                            {o.status === "Shipped" && (
                              <button
                                onClick={() => {
                                  if (
                                    confirm(
                                      "Delete this shipped order? This cannot be undone.",
                                    )
                                  ) {
                                    deleteOrder(o.id);
                                  }
                                }}
                                className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                                title="Delete shipped order"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Users */}
        {tab === "users" && (
          <div>
            <h2 className="font-playfair text-2xl font-bold mb-6">
              User Management
            </h2>
            <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-800">
                    <tr className="text-gray-400">
                      <th className="text-left px-4 py-3">Name</th>
                      <th className="text-left px-4 py-3">Email</th>
                      <th className="text-left px-4 py-3">Phone</th>
                      <th className="text-left px-4 py-3">City</th>
                      <th className="text-left px-4 py-3">Role</th>
                      <th className="text-left px-4 py-3">Orders</th>
                      <th className="text-left px-4 py-3">Joined</th>
                      <th className="text-left px-4 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => {
                      const userOrders = orders.filter(
                        (o) => o.userId === u.id,
                      );
                      return (
                        <tr
                          key={u.id}
                          className="border-t border-gray-800 hover:bg-gray-800/30"
                        >
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 bg-amber-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                                <span className="text-amber-400 text-xs font-bold">
                                  {u.name.charAt(0)}
                                </span>
                              </div>
                              <span className="text-white">{u.name}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-gray-400">{u.email}</td>
                          <td className="px-4 py-3 text-gray-400">{u.phone}</td>
                          <td className="px-4 py-3 text-gray-400">{u.city}</td>
                          <td className="px-4 py-3">
                            <span
                              className={`text-xs px-2 py-0.5 rounded-full ${u.role === "admin" ? "bg-amber-500/20 text-amber-400" : "bg-blue-500/20 text-blue-400"}`}
                            >
                              {u.role}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-gray-400">
                            {userOrders.length}
                          </td>
                          <td className="px-4 py-3 text-gray-400 text-xs">
                            {u.createdAt}
                          </td>
                          <td className="px-4 py-3">
                            {u.id !== currentUser.id && (
                              <button
                                onClick={() => handleDeleteUser(u.id)}
                                className="p-1.5 text-red-400 hover:text-red-300"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
