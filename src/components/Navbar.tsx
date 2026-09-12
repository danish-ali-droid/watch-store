import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ShoppingCart,
  User,
  Menu,
  X,
  Watch,
  Search,
  LogOut,
  LayoutDashboard,
} from "lucide-react";
import { useStore } from "../store/useStore";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const {
    cart,
    currentUser,
    isAuthenticated,
    logout,
    setSearchQuery,
    searchQuery,
  } = useStore();
  const navigate = useNavigate();
  const cartCount = cart.reduce((s, i) => s + i.quantity, 0);

  const handleLogout = () => {
    logout();
    navigate("/");
    setMenuOpen(false);
  };

  return (
    <nav className="bg-gray-950 text-white sticky top-0 z-50 shadow-2xl border-b border-amber-500/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="bg-amber-500 rounded-full p-1.5 group-hover:bg-amber-400 transition-colors">
              <Watch className="w-5 h-5 text-gray-950" />
            </div>
            <span className="font-playfair text-xl font-bold tracking-wide">
              Chrono<span className="text-amber-500">Lux</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              to="/"
              className="text-sm hover:text-amber-400 transition-colors"
            >
              Home
            </Link>
            <Link
              to="/products"
              className="text-sm hover:text-amber-400 transition-colors"
            >
              Collection
            </Link>
            <Link
              to="/products?cat=Luxury"
              className="text-sm hover:text-amber-400 transition-colors"
            >
              Luxury
            </Link>
            <Link
              to="/products?cat=Sports"
              className="text-sm hover:text-amber-400 transition-colors"
            >
              Sports
            </Link>
            <Link
              to="/products?cat=Smart"
              className="text-sm hover:text-amber-400 transition-colors"
            >
              Smart
            </Link>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {/* Search */}
            <div
              className={`hidden md:flex items-center transition-all duration-300 ${searchOpen ? "w-48" : "w-8"}`}
            >
              {searchOpen && (
                <input
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      navigate("/products");
                      setSearchOpen(false);
                    }
                  }}
                  className="bg-gray-800 text-white text-sm px-3 py-1.5 rounded-l-md outline-none w-full border border-amber-500/30"
                  placeholder="Search watches..."
                />
              )}
              <button
                onClick={() => {
                  setSearchOpen(!searchOpen);
                  if (searchOpen && searchQuery) {
                    navigate("/products");
                    setSearchOpen(false);
                  }
                }}
                className="bg-gray-800 p-1.5 rounded-md hover:bg-gray-700 transition-colors border border-amber-500/30"
              >
                <Search className="w-4 h-4 text-amber-400" />
              </button>
            </div>

            {/* Cart */}
            <Link
              to="/cart"
              className="relative p-2 hover:bg-gray-800 rounded-md transition-colors"
            >
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-amber-500 text-gray-950 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* User */}
            {isAuthenticated ? (
              <div className="hidden md:flex items-center gap-2">
                {currentUser?.role === "admin" && (
                  <Link
                    to="/admin"
                    className="flex items-center gap-1 text-sm bg-amber-500 text-gray-950 px-3 py-1.5 rounded-md font-medium hover:bg-amber-400 transition-colors"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    Dashboard
                  </Link>
                )}
                <Link
                  to="/profile"
                  className="flex items-center gap-1 text-sm hover:text-amber-400 transition-colors"
                >
                  <User className="w-4 h-4" />
                  {currentUser?.name.split(" ")[0]}
                </Link>
                <button
                  onClick={handleLogout}
                  className="p-1.5 hover:text-red-400 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Link
                  to="/login"
                  className="text-sm hover:text-amber-400 transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="text-sm bg-amber-500 text-gray-950 px-3 py-1.5 rounded-md font-medium hover:bg-amber-400 transition-colors"
                >
                  Register
                </Link>
              </div>
            )}

            {/* Mobile menu */}
            <button
              className="md:hidden p-2 hover:bg-gray-800 rounded-md"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-gray-900 border-t border-amber-500/20 px-4 py-4 space-y-3">
          <div className="flex items-center gap-2 bg-gray-800 rounded-md px-3 py-2">
            <Search className="w-4 h-4 text-amber-400" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  navigate("/products");
                  setMenuOpen(false);
                }
              }}
              className="bg-transparent text-white text-sm outline-none w-full"
              placeholder="Search watches..."
            />
          </div>
          {[
            "/",
            "/products",
            "/products?cat=Luxury",
            "/products?cat=Sports",
            "/products?cat=Smart",
          ].map((path, i) => (
            <Link
              key={i}
              to={path}
              onClick={() => setMenuOpen(false)}
              className="block text-sm hover:text-amber-400 py-1 transition-colors"
            >
              {["Home", "Collection", "Luxury", "Sports", "Smart"][i]}
            </Link>
          ))}
          <hr className="border-gray-700" />
          {isAuthenticated ? (
            <>
              {currentUser?.role === "admin" && (
                <Link
                  to="/admin"
                  onClick={() => setMenuOpen(false)}
                  className="block text-sm text-amber-400"
                >
                  Admin Dashboard
                </Link>
              )}
              <Link
                to="/profile"
                onClick={() => setMenuOpen(false)}
                className="block text-sm hover:text-amber-400"
              >
                My Profile
              </Link>
              <Link
                to="/orders"
                onClick={() => setMenuOpen(false)}
                className="block text-sm hover:text-amber-400"
              >
                My Orders
              </Link>
              <button onClick={handleLogout} className="text-sm text-red-400">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                onClick={() => setMenuOpen(false)}
                className="block text-sm hover:text-amber-400"
              >
                Login
              </Link>
              <Link
                to="/register"
                onClick={() => setMenuOpen(false)}
                className="block text-sm text-amber-400"
              >
                Register
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
