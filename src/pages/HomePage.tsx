import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Shield,
  Truck,
  Award,
  Clock,
  ChevronRight,
} from "lucide-react";
import { useStore } from "../store/useStore";
import WatchCard from "../components/WatchCard";

const formatPKR = (amount: number) => "₨ " + amount.toLocaleString("en-PK");

export default function HomePage() {
  const { watches } = useStore();
  const navigate = useNavigate();
  const featured = watches.filter((w) => w.featured).slice(0, 4);
  const newArrivals = watches.filter((w) => w.new).slice(0, 4);
  const luxury = watches.filter((w) => w.category === "Luxury").slice(0, 4);

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Hero Section */}
      <section className="relative h-[90vh] min-h-[600px] flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(/assets/pexels-190819.jpeg)` }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-gray-950 via-gray-950/80 to-transparent" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 rounded-full px-4 py-2 mb-6">
              <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
              <span className="text-amber-400 text-sm font-medium">
                Pakistan's #1 Watch Store
              </span>
            </div>
            <h1 className="font-playfair text-5xl md:text-7xl font-bold text-white leading-tight mb-6">
              Time Is Your
              <span className="text-amber-500 block">Greatest Asset</span>
            </h1>
            <p className="text-gray-300 text-lg mb-8 leading-relaxed">
              Discover premium timepieces from the world's most prestigious
              watchmakers. Authenticity guaranteed, delivered across Pakistan.
            </p>
            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => navigate("/products")}
                className="flex items-center gap-2 bg-amber-500 text-gray-950 px-8 py-3 rounded-full font-semibold hover:bg-amber-400 transition-colors text-sm"
              >
                Explore Collection <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => navigate("/products?cat=Luxury")}
                className="flex items-center gap-2 border border-amber-500 text-amber-400 px-8 py-3 rounded-full font-semibold hover:bg-amber-500/10 transition-colors text-sm"
              >
                Luxury Watches
              </button>
            </div>
            {/* Stats */}
            <div className="flex gap-8 mt-10">
              {[
                ["500+", "Watches"],
                ["10K+", "Customers"],
                ["50+", "Brands"],
                ["99%", "Authentic"],
              ].map(([val, label]) => (
                <div key={label}>
                  <p className="text-amber-400 font-bold text-xl">{val}</p>
                  <p className="text-gray-400 text-xs">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Category Banners */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              cat: "Luxury",
              label: "Luxury Collection",
              desc: "Rolex, Patek Philippe, AP",
              color: "from-amber-900/80",
              img: "/assets/pexels-15261585.jpeg",
            },
            {
              cat: "Sports",
              label: "Sports Collection",
              desc: "Casio, Seiko, TAG Heuer",
              color: "from-blue-900/80",
              img: "/assets/pexels-207489.jpeg",
            },
            {
              cat: "Smart",
              label: "Smart Collection",
              desc: "Apple, Samsung, Garmin",
              color: "from-purple-900/80",
              img: "/assets/pexels-218675.jpeg",
            },
          ].map(({ cat, label, desc, color, img }) => (
            <Link
              key={cat}
              to={`/products?cat=${cat}`}
              className="relative h-52 rounded-xl overflow-hidden group"
            >
              <img
                src={img}
                alt={label}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div
                className={`absolute inset-0 bg-gradient-to-t ${color} to-transparent`}
              />
              <div className="absolute bottom-4 left-4">
                <h3 className="text-white font-bold text-lg">{label}</h3>
                <p className="text-gray-300 text-sm">{desc}</p>
                <div className="flex items-center gap-1 text-amber-400 text-sm mt-1">
                  <span>Shop Now</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Watches */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="font-playfair text-3xl font-bold text-white">
              Featured Watches
            </h2>
            <p className="text-gray-400 text-sm mt-1">
              Handpicked by our experts
            </p>
          </div>
          <Link
            to="/products"
            className="flex items-center gap-1 text-amber-400 text-sm hover:text-amber-300"
          >
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featured.map((w) => (
            <WatchCard key={w.id} watch={w} />
          ))}
        </div>
      </section>

      {/* Banner CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div
          className="relative rounded-2xl overflow-hidden h-64"
          style={{
            backgroundImage: `url(/assets/pexels-277955.jpeg)`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="absolute inset-0 bg-gray-950/70" />
          <div className="relative flex flex-col items-center justify-center h-full text-center px-4">
            <h2 className="font-playfair text-3xl font-bold text-white mb-3">
              Limited Time Offer
            </h2>
            <p className="text-gray-300 mb-2">
              Up to 20% off on selected Luxury watches
            </p>
            <p className="text-amber-400 text-lg font-semibold mb-6">
              Starting from {formatPKR(85000)}
            </p>
            <Link
              to="/products"
              className="bg-amber-500 text-gray-950 px-8 py-3 rounded-full font-semibold hover:bg-amber-400 transition-colors"
            >
              Shop Sale
            </Link>
          </div>
        </div>
      </section>

      {/* New Arrivals */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="font-playfair text-3xl font-bold text-white">
              New Arrivals
            </h2>
            <p className="text-gray-400 text-sm mt-1">
              Fresh additions to our collection
            </p>
          </div>
          <Link
            to="/products?new=true"
            className="flex items-center gap-1 text-amber-400 text-sm hover:text-amber-300"
          >
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {newArrivals.map((w) => (
            <WatchCard key={w.id} watch={w} />
          ))}
        </div>
      </section>

      {/* Luxury Collection Highlight */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="font-playfair text-3xl font-bold text-white">
              Luxury Collection
            </h2>
            <p className="text-gray-400 text-sm mt-1">
              Icons of horological mastery
            </p>
          </div>
          <Link
            to="/products?cat=Luxury"
            className="flex items-center gap-1 text-amber-400 text-sm hover:text-amber-300"
          >
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {luxury.map((w) => (
            <WatchCard key={w.id} watch={w} />
          ))}
        </div>
      </section>

      {/* Brands Marquee */}
      <section className="py-12 bg-gray-900/50 border-y border-gray-800 overflow-hidden">
        <p className="text-center text-gray-500 text-sm mb-6 uppercase tracking-widest">
          Authorized Dealer For
        </p>
        <div className="flex gap-12 items-center animate-marquee whitespace-nowrap">
          {[
            "Rolex",
            "Omega",
            "Patek Philippe",
            "Audemars Piguet",
            "TAG Heuer",
            "Breitling",
            "IWC",
            "Casio",
            "Seiko",
            "Apple",
            "Samsung",
            "Garmin",
            "Tissot",
            "Citizen",
            "Orient",
            "Rolex",
            "Omega",
            "Patek Philippe",
            "Audemars Piguet",
            "TAG Heuer",
          ].map((brand, i) => (
            <span
              key={i}
              className="text-gray-400 font-semibold text-lg hover:text-amber-400 transition-colors cursor-default"
            >
              {brand}
            </span>
          ))}
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="font-playfair text-3xl font-bold text-white text-center mb-12">
          Why Choose ChronoLux?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            {
              icon: Shield,
              title: "100% Authentic",
              desc: "Every watch verified with official certificates and papers",
            },
            {
              icon: Truck,
              title: "Free Delivery",
              desc: "Free nationwide delivery on orders above ₨ 5,000",
            },
            {
              icon: Award,
              title: "Official Warranty",
              desc: "All watches come with manufacturer warranty",
            },
            {
              icon: Clock,
              title: "24/7 Support",
              desc: "Round-the-clock customer service in Urdu & English",
            },
          ].map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="text-center p-6 bg-gray-900 rounded-xl border border-gray-800 hover:border-amber-500/30 transition-colors"
            >
              <div className="w-12 h-12 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon className="w-6 h-6 text-amber-400" />
              </div>
              <h3 className="text-white font-semibold mb-2">{title}</h3>
              <p className="text-gray-400 text-sm">{desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
