import { useState } from "react";
import { Search, ShoppingCart } from "lucide-react";

const Shop = () => {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");

  // Dummy product data
  const products = [
    {
      id: 1,
      name: "Wireless Headphones",
      price: 15000,
      category: "electronics",
      image: "https://via.placeholder.com/250x180.png?text=Wireless+Headphones",
    },
    {
      id: 2,
      name: "Men’s Sneakers",
      price: 12000,
      category: "fashion",
      image: "https://via.placeholder.com/250x180.png?text=Men+Sneakers",
    },
    {
      id: 3,
      name: "Office Chair",
      price: 28000,
      category: "furniture",
      image: "https://via.placeholder.com/250x180.png?text=Office+Chair",
    },
    {
      id: 4,
      name: "Smartwatch Pro",
      price: 25000,
      category: "electronics",
      image: "https://via.placeholder.com/250x180.png?text=Smartwatch+Pro",
    },
  ];

  // Filtered Products
  const filteredProducts = products.filter(
    (p) =>
      (category === "all" || p.category === category) &&
      p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="pt-24 pb-16 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-blue-600 mb-3 md:mb-0">
            Shop Products
          </h2>

          {/* Search bar */}
          <div className="flex items-center border rounded-full px-3 py-1 bg-white w-full md:w-1/3">
            <Search className="text-gray-500 mr-2" />
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full outline-none text-sm"
            />
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar Filter */}
          <aside className="md:w-1/4 bg-white rounded-xl shadow p-4 h-fit">
            <h3 className="text-lg font-semibold mb-3">Categories</h3>
            <ul className="space-y-2">
              {["all", "electronics", "fashion", "furniture"].map((cat) => (
                <li key={cat}>
                  <button
                    onClick={() => setCategory(cat)}
                    className={`block w-full text-left capitalize px-3 py-2 rounded-lg transition ${
                      category === cat
                        ? "bg-blue-600 text-white"
                        : "hover:bg-gray-100"
                    }`}
                  >
                    {cat}
                  </button>
                </li>
              ))}
            </ul>
          </aside>

          {/* Product Grid */}
          <section className="md:w-3/4">
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    className="bg-white rounded-2xl shadow hover:shadow-lg transition p-3"
                  >
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-48 object-cover rounded-lg mb-3"
                    />
                    <h4 className="text-lg font-semibold text-gray-800 mb-1">
                      {product.name}
                    </h4>
                    <p className="text-blue-600 font-bold mb-3">
                      ₦{product.price.toLocaleString()}
                    </p>
                    <button className="flex items-center justify-center w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition">
                      <ShoppingCart className="w-4 h-4 mr-2" /> Add to Cart
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-600 mt-10">
                No products found.
              </p>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

export default Shop;
