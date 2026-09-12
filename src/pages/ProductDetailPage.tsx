import { useParams, useNavigate } from "react-router-dom";
import {
  ShoppingCart,
  ArrowLeft,
  Star,
  Shield,
  Truck,
  Award,
  ChevronRight,
} from "lucide-react";
import { useStore } from "../store/useStore";
import WatchCard from "../components/WatchCard";
import toast from "react-hot-toast";

const formatPKR = (n: number) => "₨ " + n.toLocaleString("en-PK");

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { watches, addToCart } = useStore();
  const watch = watches.find((w) => w.id === Number(id));

  if (!watch)
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-white text-xl mb-4">Watch not found</p>
          <button
            onClick={() => navigate("/products")}
            className="text-amber-400"
          >
            Back to Collection
          </button>
        </div>
      </div>
    );

  const related = watches
    .filter((w) => w.category === watch.category && w.id !== watch.id)
    .slice(0, 4);
  const discount = watch.originalPrice
    ? Math.round((1 - watch.price / watch.originalPrice) * 100)
    : 0;

  const handleAdd = () => {
    if (watch.stock === 0) {
      toast.error("Out of stock!");
      return;
    }
    addToCart(watch);
    toast.success("Added to cart!");
  };

  const handleBuyNow = () => {
    if (watch.stock === 0) {
      toast.error("Out of stock!");
      return;
    }
    addToCart(watch);
    navigate("/cart");
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
          <button
            onClick={() => navigate("/")}
            className="hover:text-amber-400"
          >
            Home
          </button>
          <ChevronRight className="w-4 h-4" />
          <button
            onClick={() => navigate("/products")}
            className="hover:text-amber-400"
          >
            Collection
          </button>
          <ChevronRight className="w-4 h-4" />
          <button
            onClick={() => navigate(`/products?cat=${watch.category}`)}
            className="hover:text-amber-400"
          >
            {watch.category}
          </button>
          <ChevronRight className="w-4 h-4" />
          <span className="text-white">{watch.name}</span>
        </div>

        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-amber-400 hover:text-amber-300 mb-6 text-sm"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Image */}
          <div className="space-y-4">
            <div className="relative bg-gray-900 rounded-2xl overflow-hidden h-[500px] border border-gray-800">
              <img
                src={watch.image}
                alt={watch.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                {watch.new && (
                  <span className="bg-green-500 text-white text-xs px-3 py-1 rounded-full font-medium">
                    New Arrival
                  </span>
                )}
                {discount > 0 && (
                  <span className="bg-red-500 text-white text-xs px-3 py-1 rounded-full font-medium">
                    Save {discount}%
                  </span>
                )}
                {watch.stock === 0 && (
                  <span className="bg-gray-600 text-white text-xs px-3 py-1 rounded-full">
                    Out of Stock
                  </span>
                )}
                {watch.featured && (
                  <span className="bg-amber-500/90 text-gray-950 text-xs px-3 py-1 rounded-full font-medium">
                    Featured
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Info */}
          <div>
            <p className="text-amber-400 text-sm font-medium mb-2 uppercase tracking-wider">
              {watch.brand}
            </p>
            <h1 className="font-playfair text-3xl font-bold text-white mb-4">
              {watch.name}
            </h1>

            {/* Rating */}
            <div className="flex items-center gap-2 mb-4">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${i < Math.floor(watch.rating) ? "fill-amber-400 text-amber-400" : "text-gray-600"}`}
                  />
                ))}
              </div>
              <span className="text-amber-400 font-medium">{watch.rating}</span>
              <span className="text-gray-400 text-sm">
                ({watch.reviews} reviews)
              </span>
            </div>

            {/* Price */}
            <div className="flex items-center gap-4 mb-6">
              <p className="text-3xl font-bold text-amber-400">
                {formatPKR(watch.price)}
              </p>
              {watch.originalPrice && (
                <div>
                  <p className="text-gray-500 line-through text-lg">
                    {formatPKR(watch.originalPrice)}
                  </p>
                  <p className="text-green-400 text-sm">
                    You save {formatPKR(watch.originalPrice - watch.price)}
                  </p>
                </div>
              )}
            </div>

            {/* Description */}
            <p className="text-gray-300 leading-relaxed mb-6">
              {watch.description}
            </p>

            {/* Category Badge */}
            <div className="flex gap-2 mb-6">
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${watch.category === "Luxury" ? "bg-amber-500/20 text-amber-400 border border-amber-500/30" : watch.category === "Sports" ? "bg-blue-500/20 text-blue-400 border border-blue-500/30" : "bg-purple-500/20 text-purple-400 border border-purple-500/30"}`}
              >
                {watch.category}
              </span>
              <span
                className={`px-3 py-1 rounded-full text-sm ${watch.stock > 10 ? "bg-green-500/20 text-green-400 border border-green-500/30" : watch.stock > 0 ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30" : "bg-red-500/20 text-red-400 border border-red-500/30"}`}
              >
                {watch.stock > 10
                  ? "In Stock"
                  : watch.stock > 0
                    ? `Only ${watch.stock} left`
                    : "Out of Stock"}
              </span>
            </div>

            {/* Tech Specs */}
            <div className="bg-gray-900 rounded-xl p-5 mb-6 border border-gray-800">
              <h3 className="text-white font-semibold mb-4">
                Technical Specifications
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  ["Movement", watch.movement],
                  ["Water Resistance", watch.waterResistance],
                  ["Case Material", watch.caseMaterial],
                  ["Case Size", watch.caseSize],
                  ["Warranty", watch.warranty],
                  ["Category", watch.category],
                ].map(([label, value]) => (
                  <div key={label} className="bg-gray-800/50 rounded-lg p-3">
                    <p className="text-gray-500 text-xs mb-0.5">{label}</p>
                    <p className="text-white text-sm font-medium">{value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 mb-6">
              <button
                onClick={handleAdd}
                disabled={watch.stock === 0}
                className="flex-1 flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-amber-500/50 text-white px-6 py-3 rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ShoppingCart className="w-5 h-5" />
                Add to Cart
              </button>
              <button
                onClick={handleBuyNow}
                disabled={watch.stock === 0}
                className="flex-1 bg-amber-500 hover:bg-amber-400 text-gray-950 px-6 py-3 rounded-xl font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Buy Now
              </button>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: Shield, label: "100% Authentic" },
                { icon: Truck, label: "Free Delivery" },
                { icon: Award, label: "Official Warranty" },
              ].map(({ icon: Icon, label }) => (
                <div
                  key={label}
                  className="flex flex-col items-center gap-1 p-3 bg-gray-900 rounded-lg border border-gray-800"
                >
                  <Icon className="w-5 h-5 text-amber-400" />
                  <p className="text-xs text-gray-400 text-center">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Related Products */}
        {related.length > 0 && (
          <div className="mt-16">
            <h2 className="font-playfair text-2xl font-bold text-white mb-6">
              Related Watches
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {related.map((w) => (
                <WatchCard key={w.id} watch={w} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
