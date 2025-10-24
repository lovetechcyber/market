import { useNavigate } from "react-router-dom";

const Category = () => {
  const navigate = useNavigate();

  // Sample category data (can later come from backend)
  const categories = [
    {
      id: 1,
      name: "Electronics",
      image: "https://via.placeholder.com/300x200.png?text=Electronics",
      products: 42,
    },
    {
      id: 2,
      name: "Fashion",
      image: "https://via.placeholder.com/300x200.png?text=Fashion",
      products: 28,
    },
    {
      id: 3,
      name: "Furniture",
      image: "https://via.placeholder.com/300x200.png?text=Furniture",
      products: 15,
    },
    {
      id: 4,
      name: "Beauty & Health",
      image: "https://via.placeholder.com/300x200.png?text=Beauty+%26+Health",
      products: 18,
    },
    {
      id: 5,
      name: "Home Appliances",
      image: "https://via.placeholder.com/300x200.png?text=Home+Appliances",
      products: 23,
    },
  ];

  const handleCategoryClick = (name) => {
    navigate(`/shop?category=${name.toLowerCase()}`);
  };

  return (
    <div className="pt-24 pb-16 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 text-center">
        <h2 className="text-3xl font-bold text-blue-600 mb-3">Shop by Category</h2>
        <p className="text-gray-600 mb-8">
          Explore products by category and find exactly what you need.
        </p>

        {/* Category Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {categories.map((cat) => (
            <div
              key={cat.id}
              onClick={() => handleCategoryClick(cat.name)}
              className="bg-white rounded-2xl shadow hover:shadow-lg transition transform hover:-translate-y-1 cursor-pointer overflow-hidden"
            >
              <img
                src={cat.image}
                alt={cat.name}
                className="w-full h-48 object-cover"
              />
              <div className="p-4 text-left">
                <h3 className="text-lg font-semibold text-gray-800">
                  {cat.name}
                </h3>
                <p className="text-sm text-gray-500">
                  {cat.products} products available
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Category;
