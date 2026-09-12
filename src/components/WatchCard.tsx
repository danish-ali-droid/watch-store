import { Link } from "react-router-dom";
import { ShoppingCart, Star, Heart } from "lucide-react";
import { Watch, useStore } from "../store/useStore";
import { useState } from "react";
import toast from "react-hot-toast";

interface Props {
  watch: Watch;
}

const formatPKR = (amount: number) => "₨ " + amount.toLocaleString("en-PK");

export default function WatchCard({ watch }: Props) {
  const { addToCart } = useStore();
  const [liked, setLiked] = useState(false);
  const discount = watch.originalPrice
    ? Math.round((1 - watch.price / watch.originalPrice) * 100)
    : 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (watch.stock === 0) {
      toast.error("Out of stock!");
      return;
    }
    addToCart(watch);
    toast.success(`${watch.name} added to cart!`);
  };

  return (
    <Link
      to={`/product/${watch.id}`}
      className="group block bg-gray-900 rounded-xl overflow-hidden border border-gray-800 hover:border-amber-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-amber-500/10 hover:-translate-y-1"
    >
      {/* Image */}
      <div className="relative overflow-hidden h-52 bg-gray-800">
        <img
          src={watch.image}
          alt={watch.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {watch.new && (
            <span className="bg-green-500 text-white text-xs px-2 py-0.5 rounded-full font-medium">
              New
            </span>
          )}
          {discount > 0 && (
            <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-medium">
              -{discount}%
            </span>
          )}
          {watch.stock === 0 && (
            <span className="bg-gray-600 text-white text-xs px-2 py-0.5 rounded-full font-medium">
              Out of Stock
            </span>
          )}
        </div>
        {/* Wishlist */}
        <button
          onClick={(e) => {
            e.preventDefault();
            setLiked(!liked);
          }}
          className="absolute top-2 right-2 p-1.5 bg-gray-950/70 rounded-full hover:bg-amber-500 transition-colors"
        >
          <Heart
            className={`w-4 h-4 ${liked ? "fill-red-400 text-red-400" : "text-gray-300"}`}
          />
        </button>
        {/* Category badge */}
        <span
          className={`absolute bottom-2 right-2 text-xs px-2 py-0.5 rounded-full font-medium ${watch.category === "Luxury" ? "bg-amber-500/90 text-gray-950" : watch.category === "Sports" ? "bg-blue-500/90 text-white" : "bg-purple-500/90 text-white"}`}
        >
          {watch.category}
        </span>
      </div>

      {/* Info */}
      <div className="p-4">
        <p className="text-xs text-amber-400 font-medium mb-1">{watch.brand}</p>
        <h3 className="text-white font-semibold text-sm leading-tight mb-2 group-hover:text-amber-300 transition-colors line-clamp-2">
          {watch.name}
        </h3>

        {/* Rating */}
        <div className="flex items-center gap-1 mb-3">
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-3 h-3 ${i < Math.floor(watch.rating) ? "fill-amber-400 text-amber-400" : "text-gray-600"}`}
              />
            ))}
          </div>
          <span className="text-xs text-gray-400">({watch.reviews})</span>
        </div>

        {/* Price */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-amber-400 font-bold">{formatPKR(watch.price)}</p>
            {watch.originalPrice && (
              <p className="text-gray-500 text-xs line-through">
                {formatPKR(watch.originalPrice)}
              </p>
            )}
          </div>
          <button
            onClick={handleAddToCart}
            disabled={watch.stock === 0}
            className="p-2 bg-amber-500 text-gray-950 rounded-lg hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ShoppingCart className="w-4 h-4" />
          </button>
        </div>
      </div>
    </Link>
  );
}
