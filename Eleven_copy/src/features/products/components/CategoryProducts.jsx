import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../../../api/apiService";
import ProductCard from "../../../components/ui/ProductCard";

const CategoryProducts = () => {
  const { categorySlug } = useParams();

  const [products, setProducts] = useState([]);
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState({
    gender: "",
    minPrice: "",
    maxPrice: "",
    sortBy: ""
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // ✅ Fetch category details
  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const res = await api.get("/products/categories/");
        const found = res.data.find(cat => cat.slug === categorySlug);
        setCategory(found);
      } catch (error) {
        console.error("Category fetch error:", error);
      }
    };

    fetchCategory();
  }, [categorySlug]);

  // ✅ Fetch products using backend filtering
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);

        let url = `/products/?page=${currentPage}&category=${categorySlug}`;

        if (filters.gender) {
          url += `&gender=${filters.gender}`;
        }

        if (filters.minPrice) {
          url += `&min_price=${filters.minPrice}`;
        }

        if (filters.maxPrice) {
          url += `&max_price=${filters.maxPrice}`;
        }

        const response = await api.get(url);

        let results = response.data.results;

        // Sorting (optional frontend sort)
        if (filters.sortBy === "price-low") {
          results.sort((a, b) => a.price - b.price);
        } else if (filters.sortBy === "price-high") {
          results.sort((a, b) => b.price - a.price);
        }

        setProducts(results);
        setTotalPages(Math.ceil(response.data.count / 10));
      } catch (error) {
        console.error("Product fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [categorySlug, filters, currentPage]);

  const handleChange = (type, value) => {
    setCurrentPage(1);
    setFilters(prev => ({ ...prev, [type]: value }));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pt-16">

      {/* Breadcrumb */}
      <div className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4 text-sm">
          <Link to="/" className="text-gray-500">Home</Link> /
          <Link to="/shop" className="text-gray-500 ml-2">Shop</Link> /
          <span className="ml-2 capitalize">{category?.name}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">

        <h1 className="text-4xl font-serif font-light mb-6 capitalize text-center">
          {category?.name}
        </h1>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-8">

          <select
            value={filters.gender}
            onChange={(e) => handleChange("gender", e.target.value)}
            className="border px-4 py-2"
          >
            <option value="">All Genders</option>
            <option value="men">Men</option>
            <option value="women">Women</option>
          </select>

          <input
            type="number"
            placeholder="Min Price"
            value={filters.minPrice}
            onChange={(e) => handleChange("minPrice", e.target.value)}
            className="border px-4 py-2"
          />

          <input
            type="number"
            placeholder="Max Price"
            value={filters.maxPrice}
            onChange={(e) => handleChange("maxPrice", e.target.value)}
            className="border px-4 py-2"
          />

          <select
            value={filters.sortBy}
            onChange={(e) => handleChange("sortBy", e.target.value)}
            className="border px-4 py-2"
          >
            <option value="">Default</option>
            <option value="price-low">Price Low → High</option>
            <option value="price-high">Price High → Low</option>
          </select>
        </div>

        {/* Products */}
        {products.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {products.map(product => (
                <ProductCard
                  key={product.id}
                  product={{
                    ...product,
                    images: product.images?.map(img => img.image),
                  }}
                />
              ))}
            </div>

            {/* Pagination */}
            <div className="flex justify-center mt-10 gap-4">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => prev - 1)}
                className="border px-4 py-2 disabled:opacity-40"
              >
                Previous
              </button>

              <span>Page {currentPage} of {totalPages}</span>

              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => prev + 1)}
                className="border px-4 py-2 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </>
        ) : (
          <div className="text-center py-10 text-gray-500">
            No products found.
          </div>
        )}

      </div>
    </div>
  );
};

export default CategoryProducts;