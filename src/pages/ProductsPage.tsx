import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { SlidersHorizontal, X, Search, ChevronDown } from "lucide-react";
import { useStore } from "../store/useStore";
import WatchCard from "../components/WatchCard";

const formatPKR = (n: number) => "₨ " + n.toLocaleString("en-PK");

export default function ProductsPage() {
  const { watches, searchQuery, setSearchQuery } = useStore();
  const [searchParams] = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);
  const [localSearch, setLocalSearch] = useState(searchQuery);
  const [selectedCategory, setSelectedCategory] = useState(
    searchParams.get("cat") || "",
  );
  const [selectedBrand, setSelectedBrand] = useState("");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000000]);
  const [sortBy, setSortBy] = useState("featured");
  const [page, setPage] = useState(1);
  const PER_PAGE = 10;

  useEffect(() => {
    const cat = searchParams.get("cat") || "";
    setSelectedCategory(cat);
    setPage(1);
  }, [searchParams]);

  useEffect(() => {
    setLocalSearch(searchQuery);
  }, [searchQuery]);

  const brands = [...new Set(watches.map((w) => w.brand))];
  const categories = ["Luxury", "Sports", "Smart"];

  let filtered = watches.filter((w) => {
    const matchSearch =
      !localSearch ||
      w.name.toLowerCase().includes(localSearch.toLowerCase()) ||
      w.brand.toLowerCase().includes(localSearch.toLowerCase());
    const matchCat = !selectedCategory || w.category === selectedCategory;
    const matchBrand = !selectedBrand || w.brand === selectedBrand;
    const matchPrice = w.price >= priceRange[0] && w.price <= priceRange[1];
    return matchSearch && matchCat && matchBrand && matchPrice;
  });

  // Sort
  filtered = [...filtered].sort((a, b) => {
    if (sortBy === "price-asc") return a.price - b.price;
    if (sortBy === "price-desc") return b.price - a.price;
    if (sortBy === "rating") return b.rating - a.rating;
    if (sortBy === "name") return a.name.localeCompare(b.name);
    return b.featured ? 1 : -1;
  });

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const clearFilters = () => {
    setSelectedCategory("");
    setSelectedBrand("");
    setPriceRange([0, 10000000]);
    setLocalSearch("");
    setSearchQuery("");
    setPage(1);
  };

  const hasFilters =
    selectedCategory ||
    selectedBrand ||
    localSearch ||
    priceRange[0] > 0 ||
    priceRange[1] < 10000000;

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="font-playfair text-3xl font-bold text-white mb-2">
            {selectedCategory
              ? `${selectedCategory} Watches`
              : "Watch Collection"}
          </h1>
          <p className="text-gray-400 text-sm">
            {filtered.length} watches found
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Controls */}
        <div className="flex flex-wrap gap-3 items-center justify-between mb-6">
          {/* Search */}
          <div className="flex items-center gap-2 bg-gray-800 rounded-lg px-3 py-2 flex-1 min-w-[200px] max-w-sm border border-gray-700">
            <Search className="w-4 h-4 text-gray-400" />
            <input
              value={localSearch}
              onChange={(e) => {
                setLocalSearch(e.target.value);
                setPage(1);
              }}
              className="bg-transparent text-white text-sm outline-none w-full placeholder-gray-500"
              placeholder="Search watches..."
            />
            {localSearch && (
              <button onClick={() => setLocalSearch("")}>
                <X className="w-4 h-4 text-gray-400" />
              </button>
            )}
          </div>

          <div className="flex gap-2 items-center">
            {/* Sort */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-gray-800 border border-gray-700 text-white text-sm rounded-lg px-3 py-2 pr-8 outline-none appearance-none cursor-pointer"
              >
                <option value="featured">Featured</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating">Top Rated</option>
                <option value="name">Name A-Z</option>
              </select>
              <ChevronDown className="w-4 h-4 text-gray-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm border transition-colors ${showFilters ? "bg-amber-500 text-gray-950 border-amber-500" : "bg-gray-800 text-white border-gray-700 hover:border-amber-500/50"}`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
              {hasFilters && (
                <span className="bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                  !
                </span>
              )}
            </button>

            {hasFilters && (
              <button
                onClick={clearFilters}
                className="text-xs text-amber-400 hover:text-amber-300 px-2"
              >
                Clear All
              </button>
            )}
          </div>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Category */}
              <div>
                <h3 className="text-white font-medium mb-3 text-sm">
                  Category
                </h3>
                <div className="flex flex-wrap gap-2">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => {
                        setSelectedCategory(
                          selectedCategory === cat ? "" : cat,
                        );
                        setPage(1);
                      }}
                      className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${selectedCategory === cat ? "bg-amber-500 text-gray-950 border-amber-500" : "border-gray-700 text-gray-300 hover:border-amber-500/50"}`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Brand */}
              <div>
                <h3 className="text-white font-medium mb-3 text-sm">Brand</h3>
                <div className="relative">
                  <select
                    value={selectedBrand}
                    onChange={(e) => {
                      setSelectedBrand(e.target.value);
                      setPage(1);
                    }}
                    className="w-full bg-gray-800 border border-gray-700 text-white text-sm rounded-lg px-3 py-2 outline-none appearance-none"
                  >
                    <option value="">All Brands</option>
                    {brands.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-gray-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Price Range */}
              <div>
                <h3 className="text-white font-medium mb-3 text-sm">
                  Price Range
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-amber-400">
                    <span>{formatPKR(priceRange[0])}</span>
                    <span>{formatPKR(priceRange[1])}</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={10000000}
                    step={50000}
                    value={priceRange[1]}
                    onChange={(e) => {
                      setPriceRange([priceRange[0], +e.target.value]);
                      setPage(1);
                    }}
                    className="w-full accent-amber-500"
                  />
                  <div className="flex gap-2">
                    {[100000, 500000, 1000000, 5000000].map((p) => (
                      <button
                        key={p}
                        onClick={() => {
                          setPriceRange([0, p]);
                          setPage(1);
                        }}
                        className="text-xs px-2 py-1 bg-gray-800 border border-gray-700 rounded hover:border-amber-500/50 text-gray-300"
                      >
                        Under {formatPKR(p)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Active Filters */}
        {hasFilters && (
          <div className="flex flex-wrap gap-2 mb-4">
            {selectedCategory && (
              <span className="flex items-center gap-1 bg-amber-500/20 text-amber-400 text-xs px-3 py-1 rounded-full border border-amber-500/30">
                {selectedCategory}
                <button onClick={() => setSelectedCategory("")}>
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {selectedBrand && (
              <span className="flex items-center gap-1 bg-amber-500/20 text-amber-400 text-xs px-3 py-1 rounded-full border border-amber-500/30">
                {selectedBrand}
                <button onClick={() => setSelectedBrand("")}>
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {localSearch && (
              <span className="flex items-center gap-1 bg-amber-500/20 text-amber-400 text-xs px-3 py-1 rounded-full border border-amber-500/30">
                "{localSearch}"
                <button onClick={() => setLocalSearch("")}>
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
          </div>
        )}

        {/* Products Grid */}
        {paginated.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-400 text-lg">
              No watches found matching your criteria.
            </p>
            <button
              onClick={clearFilters}
              className="mt-4 text-amber-400 hover:text-amber-300 text-sm"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {paginated.map((w) => (
              <WatchCard key={w.id} watch={w} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-10">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 bg-gray-800 text-white rounded-lg disabled:opacity-40 hover:bg-gray-700 text-sm"
            >
              Prev
            </button>
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => setPage(i + 1)}
                className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${page === i + 1 ? "bg-amber-500 text-gray-950" : "bg-gray-800 text-white hover:bg-gray-700"}`}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 bg-gray-800 text-white rounded-lg disabled:opacity-40 hover:bg-gray-700 text-sm"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
