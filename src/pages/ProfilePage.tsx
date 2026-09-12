import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, Phone, Mail, MapPin, Lock, Save, Package } from "lucide-react";
import { useStore } from "../store/useStore";
import toast from "react-hot-toast";

export default function ProfilePage() {
  const { currentUser, updateProfile, isAuthenticated, orders } = useStore();
  const navigate = useNavigate();
  const [tab, setTab] = useState<"profile" | "password">("profile");
  const [form, setForm] = useState({
    name: currentUser?.name || "",
    phone: currentUser?.phone || "",
    email: currentUser?.email || "",
    address: currentUser?.address || "",
    city: currentUser?.city || "",
  });
  const [pwdForm, setPwdForm] = useState({
    current: "",
    newPwd: "",
    confirm: "",
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-white text-xl mb-4">
            Please login to view your profile
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

  const myOrders = orders.filter((o) => o.userId === currentUser?.id);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile(form);
    toast.success("Profile updated successfully!");
  };

  const handlePwdChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (pwdForm.newPwd.length < 8) {
      toast.error("New password must be at least 8 characters");
      return;
    }
    if (pwdForm.newPwd !== pwdForm.confirm) {
      toast.error("Passwords do not match");
      return;
    }
    // In real app, verify current password via API
    const pwds: Record<string, string> =
      (window as any).__CHRONOLUX_PASSWORDS || {};
    if (
      pwds[currentUser!.email] &&
      pwds[currentUser!.email] !== pwdForm.current
    ) {
      toast.error("Current password is incorrect");
      return;
    }
    if ((window as any).__CHRONOLUX_PASSWORDS) {
      (window as any).__CHRONOLUX_PASSWORDS[currentUser!.email] =
        pwdForm.newPwd;
    }
    setPwdForm({ current: "", newPwd: "", confirm: "" });
    toast.success("Password changed successfully!");
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="font-playfair text-3xl font-bold mb-8">My Account</h1>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: "Total Orders", value: myOrders.length },
            {
              label: "Delivered",
              value: myOrders.filter((o) => o.status === "Delivered").length,
            },
            {
              label: "Active Orders",
              value: myOrders.filter((o) =>
                ["Pending", "Processing", "Shipped"].includes(o.status),
              ).length,
            },
          ].map(({ label, value }) => (
            <div
              key={label}
              className="bg-gray-900 rounded-xl p-4 border border-gray-800 text-center"
            >
              <p className="text-amber-400 font-bold text-2xl">{value}</p>
              <p className="text-gray-400 text-sm mt-1">{label}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sidebar */}
          <div>
            <div className="bg-gray-900 rounded-xl border border-gray-800 p-5 mb-4">
              <div className="w-16 h-16 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="w-8 h-8 text-amber-400" />
              </div>
              <p className="text-white font-semibold text-center">
                {currentUser?.name}
              </p>
              <p className="text-gray-400 text-sm text-center mt-1">
                {currentUser?.email}
              </p>
              <span
                className={`block text-center mt-2 text-xs px-2 py-0.5 rounded-full w-fit mx-auto ${currentUser?.role === "admin" ? "bg-amber-500/20 text-amber-400" : "bg-blue-500/20 text-blue-400"}`}
              >
                {currentUser?.role === "admin" ? "Administrator" : "Customer"}
              </span>
              <p className="text-gray-600 text-xs text-center mt-2">
                Member since {currentUser?.createdAt}
              </p>
            </div>

            <div className="space-y-2">
              {[
                { key: "profile", label: "Edit Profile", icon: User },
                { key: "password", label: "Change Password", icon: Lock },
              ].map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setTab(key as any)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm transition-colors ${tab === key ? "bg-amber-500 text-gray-950 font-medium" : "bg-gray-900 border border-gray-800 text-gray-300 hover:bg-gray-800"}`}
                >
                  <Icon className="w-4 h-4" /> {label}
                </button>
              ))}
              <button
                onClick={() => navigate("/orders")}
                className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm bg-gray-900 border border-gray-800 text-gray-300 hover:bg-gray-800 transition-colors"
              >
                <Package className="w-4 h-4" /> My Orders
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-2">
            {tab === "profile" && (
              <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
                <h2 className="text-white font-semibold text-lg mb-5">
                  Personal Information
                </h2>
                <form onSubmit={handleSave} className="space-y-4">
                  <div>
                    <label className="text-gray-400 text-sm mb-1.5 block flex items-center gap-1">
                      <User className="w-3 h-3" /> Full Name
                    </label>
                    <input
                      value={form.name}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, name: e.target.value }))
                      }
                      className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-2.5 text-sm outline-none focus:border-amber-500"
                      placeholder="Ahmad Khan"
                    />
                  </div>
                  <div>
                    <label className="text-gray-400 text-sm mb-1.5 block flex items-center gap-1">
                      <Mail className="w-3 h-3" /> Email (cannot change)
                    </label>
                    <input
                      value={form.email}
                      disabled
                      className="w-full bg-gray-800/50 border border-gray-700 text-gray-500 rounded-xl px-4 py-2.5 text-sm outline-none cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="text-gray-400 text-sm mb-1.5 block flex items-center gap-1">
                      <Phone className="w-3 h-3" /> Phone Number
                    </label>
                    <input
                      value={form.phone}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, phone: e.target.value }))
                      }
                      className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-2.5 text-sm outline-none focus:border-amber-500"
                      placeholder="03001234567"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-gray-400 text-sm mb-1.5 block flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> City
                      </label>
                      <select
                        value={form.city}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, city: e.target.value }))
                        }
                        className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-2.5 text-sm outline-none focus:border-amber-500"
                      >
                        <option value="">Select City</option>
                        {[
                          "Karachi",
                          "Lahore",
                          "Islamabad",
                          "Rawalpindi",
                          "Faisalabad",
                          "Multan",
                          "Peshawar",
                          "Quetta",
                        ].map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-gray-400 text-sm mb-1.5 block">
                        Address
                      </label>
                      <input
                        value={form.address}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, address: e.target.value }))
                        }
                        className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-2.5 text-sm outline-none focus:border-amber-500"
                        placeholder="Street, Area"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="flex items-center gap-2 bg-amber-500 text-gray-950 px-6 py-2.5 rounded-xl font-semibold hover:bg-amber-400 transition-colors"
                  >
                    <Save className="w-4 h-4" /> Save Changes
                  </button>
                </form>
              </div>
            )}

            {tab === "password" && (
              <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
                <h2 className="text-white font-semibold text-lg mb-5">
                  Change Password
                </h2>
                <form onSubmit={handlePwdChange} className="space-y-4">
                  {[
                    {
                      key: "current",
                      label: "Current Password",
                      placeholder: "Enter current password",
                    },
                    {
                      key: "newPwd",
                      label: "New Password",
                      placeholder: "Min 8 characters",
                    },
                    {
                      key: "confirm",
                      label: "Confirm New Password",
                      placeholder: "Repeat new password",
                    },
                  ].map(({ key, label, placeholder }) => (
                    <div key={key}>
                      <label className="text-gray-400 text-sm mb-1.5 block">
                        {label}
                      </label>
                      <input
                        type="password"
                        value={pwdForm[key as keyof typeof pwdForm]}
                        onChange={(e) =>
                          setPwdForm((f) => ({ ...f, [key]: e.target.value }))
                        }
                        className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-2.5 text-sm outline-none focus:border-amber-500"
                        placeholder={placeholder}
                      />
                    </div>
                  ))}
                  <button
                    type="submit"
                    className="flex items-center gap-2 bg-amber-500 text-gray-950 px-6 py-2.5 rounded-xl font-semibold hover:bg-amber-400 transition-colors"
                  >
                    <Lock className="w-4 h-4" /> Change Password
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
