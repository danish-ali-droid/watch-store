import { Link, useNavigate } from "react-router-dom";
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from "lucide-react";
import { useStore } from "../store/useStore";

const formatPKR = (n: number) => "₨ " + n.toLocaleString("en-PK");

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, isAuthenticated } = useStore();
  const navigate = useNavigate();

  const subtotal = cart.reduce((s, i) => s + i.watch.price * i.quantity, 0);
  const shipping = subtotal > 5000 ? 0 : 500;
  const total = subtotal + shipping;

  if (cart.length === 0)
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <ShoppingBag className="w-20 h-20 text-gray-700 mx-auto mb-4" />
          <h2 className="text-white text-2xl font-bold mb-2">
            Your cart is empty
          </h2>
          <p className="text-gray-400 mb-6">
            Discover our premium watch collection
          </p>
          <Link
            to="/products"
            className="bg-amber-500 text-gray-950 px-8 py-3 rounded-full font-semibold hover:bg-amber-400 transition-colors"
          >
            Shop Now
          </Link>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="font-playfair text-3xl font-bold mb-8">Shopping Cart</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.map(({ watch, quantity }) => (
              <div
                key={watch.id}
                className="bg-gray-900 rounded-xl p-4 border border-gray-800 flex gap-4"
              >
                <Link to={`/product/${watch.id}`}>
                  <img
                    src={watch.image}
                    alt={watch.name}
                    className="w-24 h-24 object-cover rounded-lg flex-shrink-0"
                  />
                </Link>
                <div className="flex-1 min-w-0">
                  <p className="text-amber-400 text-xs mb-0.5">{watch.brand}</p>
                  <Link
                    to={`/product/${watch.id}`}
                    className="text-white font-medium hover:text-amber-300 transition-colors line-clamp-1"
                  >
                    {watch.name}
                  </Link>
                  <p className="text-gray-400 text-sm mt-0.5">
                    {watch.category}
                  </p>
                  <p className="text-amber-400 font-bold mt-2">
                    {formatPKR(watch.price)}
                  </p>
                </div>
                <div className="flex flex-col items-end justify-between">
                  <button
                    onClick={() => removeFromCart(watch.id)}
                    className="text-gray-500 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQuantity(watch.id, quantity - 1)}
                      className="w-7 h-7 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-6 text-center text-sm font-medium">
                      {quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(watch.id, quantity + 1)}
                      disabled={quantity >= watch.stock}
                      className="w-7 h-7 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors disabled:opacity-50"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                  <p className="text-white font-semibold text-sm">
                    {formatPKR(watch.price * quantity)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div>
            <div className="bg-gray-900 rounded-xl p-6 border border-gray-800 sticky top-20">
              <h2 className="text-white font-semibold text-lg mb-4">
                Order Summary
              </h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-gray-400">
                  <span>
                    Subtotal ({cart.reduce((s, i) => s + i.quantity, 0)} items)
                  </span>
                  <span className="text-white">{formatPKR(subtotal)}</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Shipping</span>
                  <span
                    className={shipping === 0 ? "text-green-400" : "text-white"}
                  >
                    {shipping === 0 ? "FREE" : formatPKR(shipping)}
                  </span>
                </div>
                {shipping > 0 && (
                  <p className="text-xs text-gray-500">
                    Free shipping on orders above {formatPKR(5000)}
                  </p>
                )}
                <div className="border-t border-gray-800 pt-3 flex justify-between font-bold text-lg">
                  <span className="text-white">Total</span>
                  <span className="text-amber-400">{formatPKR(total)}</span>
                </div>
              </div>

              <button
                onClick={() => {
                  if (!isAuthenticated) {
                    navigate("/login");
                    return;
                  }
                  navigate("/checkout");
                }}
                className="w-full bg-amber-500 hover:bg-amber-400 text-gray-950 font-semibold py-3 rounded-xl mt-6 transition-colors flex items-center justify-center gap-2"
              >
                Proceed to Checkout <ArrowRight className="w-4 h-4" />
              </button>
              <Link
                to="/products"
                className="block text-center text-amber-400 text-sm mt-3 hover:text-amber-300"
              >
                Continue Shopping
              </Link>

              {/* Payment Icons */}
              <div className="mt-4 pt-4 border-t border-gray-800">
                <p className="text-gray-500 text-xs text-center mb-2">
                  Secure Payment Options
                </p>
                <div className="flex justify-center gap-2">
                  {["COD", "Visa", "MC", "JCB"].map((p) => (
                    <span
                      key={p}
                      className="bg-gray-800 text-gray-400 text-xs px-2 py-1 rounded"
                    >
                      {p}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
