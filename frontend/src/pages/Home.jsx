import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div className="pt-20">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-center py-20">
        <h1 className="text-4xl font-bold mb-4">Buy, Sell & Connect Securely</h1>
        <p className="text-lg mb-6">
          Explore thousands of trusted sellers and buyers on our marketplace.
        </p>
        <Link
          to="/shop"
          className="bg-white text-blue-600 px-6 py-2 rounded-full font-medium hover:bg-gray-100"
        >
          Start Shopping
        </Link>
      </section>

      {/* Categories */}
      <section className="max-w-6xl mx-auto py-12 px-4">
        <h2 className="text-2xl font-semibold text-center mb-8">Popular Categories</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {["Electronics", "Fashion", "Home & Living"].map((cat, i) => (
            <div
              key={i}
              className="bg-gray-100 rounded-xl p-6 text-center shadow hover:shadow-lg transition"
            >
              <h3 className="text-lg font-medium">{cat}</h3>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="bg-gray-50 py-12">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-2xl font-semibold text-center mb-8">Featured Products</h2>
          <div className="grid md:grid-cols-4 gap-6">
            {[1,2,3,4].map((i) => (
              <div key={i} className="bg-white p-4 rounded-xl shadow hover:shadow-lg transition">
                <div className="bg-gray-200 h-40 rounded-md mb-3"></div>
                <h4 className="font-medium text-gray-800">Product {i}</h4>
                <p className="text-gray-600">$20.00</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
