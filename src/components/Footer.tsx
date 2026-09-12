import { Link } from "react-router-dom";
import { Watch, MapPin, Phone, Mail } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gray-950 text-gray-300 border-t border-amber-500/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-amber-500 rounded-full p-1.5">
                <Watch className="w-5 h-5 text-gray-950" />
              </div>
              <span className="font-bold text-xl text-white">
                Chrono<span className="text-amber-500">Lux</span>
              </span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              Pakistan's premier luxury watch destination. Authentic timepieces
              from the world's finest brands, delivered to your doorstep.
            </p>
            <div className="flex gap-3 mt-4">
              <a
                href="#"
                className="p-2 bg-gray-800 rounded-md hover:bg-amber-500 hover:text-gray-950 transition-colors text-xs font-bold"
              >
                FB
              </a>
              <a
                href="#"
                className="p-2 bg-gray-800 rounded-md hover:bg-amber-500 hover:text-gray-950 transition-colors text-xs font-bold"
              >
                IG
              </a>
              <a
                href="#"
                className="p-2 bg-gray-800 rounded-md hover:bg-amber-500 hover:text-gray-950 transition-colors text-xs font-bold"
              >
                TW
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              {[
                ["/", "Home"],
                ["/products", "Collection"],
                ["/products?cat=Luxury", "Luxury Watches"],
                ["/products?cat=Sports", "Sports Watches"],
                ["/products?cat=Smart", "Smart Watches"],
              ].map(([to, label]) => (
                <li key={to}>
                  <Link
                    to={to}
                    className="hover:text-amber-400 transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="text-white font-semibold mb-4">Customer Service</h3>
            <ul className="space-y-2 text-sm">
              {[
                ["/profile", "My Account"],
                ["/orders", "Order Tracking"],
                ["/cart", "Shopping Cart"],
                ["/login", "Login / Register"],
              ].map(([to, label]) => (
                <li key={to}>
                  <Link
                    to={to}
                    className="hover:text-amber-400 transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-4">Contact Us</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                <span className="text-gray-400">
                  123 Main Boulevard, DHA Phase 5, Lahore, Pakistan
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <span className="text-gray-400">+92-42-3571-8900</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <span className="text-gray-400">info@chronolux.pk</span>
              </div>
            </div>
            <div className="mt-4 p-3 bg-amber-500/10 rounded-md border border-amber-500/20">
              <p className="text-xs text-amber-400 font-medium">
                Business Hours
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Mon-Sat: 10:00 AM - 8:00 PM
              </p>
              <p className="text-xs text-gray-400">
                Sunday: 12:00 PM - 6:00 PM
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-10 pt-6 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-xs text-gray-500">
            © 2024 ChronoLux Pakistan. All rights reserved.
          </p>
          <div className="flex gap-4 text-xs text-gray-500">
            <a href="#" className="hover:text-amber-400">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-amber-400">
              Terms of Service
            </a>
            <a href="#" className="hover:text-amber-400">
              Return Policy
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
