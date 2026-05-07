import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../api/apiService";
import ProductCard from "../../Components/ui/ProductCard";

const NewArrivals = () => {
  const [newProducts, setNewProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNewArrivals = async () => {
      try {
        const { data: newData } = await api.get("/products/?is_new=true&page_size=50");
        const newArrivals = newData.results || newData;
        setNewProducts(newArrivals);
      } catch (error) {
        console.error('Error fetching new arrivals:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNewArrivals();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-white pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-sm font-light tracking-widest uppercase">Loading New Arrivals</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pt-20">
      {/* Hero Section */}
      <section className="relative h-96 flex items-center justify-center overflow-hidden bg-black">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=2000&q=80"
            alt="New Arrivals"
            className="w-full h-full object-cover opacity-40"
          />
        </div>
        
        <div className="relative text-center text-white px-6 max-w-4xl">
          <h1 className="text-5xl md:text-6xl font-serif font-light mb-6 tracking-tight">
            NEW ARRIVALS
          </h1>
          <p className="text-lg font-light tracking-widest uppercase mb-8">
            Discover the latest additions to our collection
          </p>
          <div className="w-16 h-px bg-white mx-auto"></div>
        </div>
      </section>

      {/* Introduction Text */}
      <section className="py-16 border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-2xl font-serif font-light mb-6 tracking-wide">
            Fresh Perspectives in Luxury Footwear
          </h2>
          <p className="text-gray-600 text-lg font-light leading-relaxed max-w-2xl mx-auto">
            Experience the latest innovations in design and craftsmanship. 
            Each new arrival embodies our commitment to exceptional quality 
            and contemporary elegance.
          </p>
        </div>
      </section>

      {/* New Arrivals Grid */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl font-serif font-light mb-4 tracking-wide">
            Latest Collection
          </h2>
          <p className="text-gray-500 text-sm uppercase tracking-widest font-light">
            {newProducts.length} New Pieces
          </p>
        </div>

        {/* Option 1: Use your existing ProductCard component (Recommended) */}
        {newProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {newProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="text-center py-16">
            <div className="max-w-md mx-auto">
              <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m8-8V4a1 1 0 00-1-1h-2a1 1 0 00-1 1v1M9 7h6" />
              </svg>
              <h3 className="text-xl font-light tracking-wide text-gray-600 mb-4">
                No New Arrivals
              </h3>
              <p className="text-gray-500 font-light mb-6">
                Check back soon for our latest collections and exclusive releases.
              </p>
              <Link
                to="/shop"
                className="inline-block border border-black text-black px-6 py-3 text-sm font-light tracking-widest uppercase hover:bg-black hover:text-white transition duration-300"
              >
                Browse All Collections
              </Link>
            </div>
          </div>
        )}

        {/* View All Button */}
        {newProducts.length > 0 && (
          <div className="text-center mt-16">
            <Link
              to="/shop"
              className="inline-block border border-black text-black px-8 py-4 text-sm font-light tracking-widest uppercase hover:bg-black hover:text-white transition duration-300"
            >
              View Full Collection
            </Link>
          </div>
        )}
      </section>
    </div>
  );
};

export default NewArrivals;
