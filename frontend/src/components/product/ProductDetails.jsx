import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";

function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isReporting, setIsReporting] = useState(false);
  const [reportForm, setReportForm] = useState({
    reason: "",
    isPaymentRelated: false,
    files: [],
  });

  useEffect(() => {
    // Fetch product details
    axios.get(`/api/products/${id}`).then((res) => setProduct(res.data));

    // Fetch related products
    axios.get(`/api/products/${id}/related`).then((res) => setRelated(res.data));

    // Update recent views
    axios.post(
      `/api/products/${id}/view`,
      {},
      { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
    );
  }, [id]);

  if (!product) return <div className="p-10 text-center">Loading...</div>;

  const media = [...(product.images || []), product.video].filter(Boolean);

  // ----------------- Add to Cart -----------------
  const handleAddToCart = async () => {
    try {
      await axios.post(
        `/api/cart/add`,
        { productId: id },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      alert("✅ Item added to cart!");
    } catch (err) {
      console.error(err);
      alert("❌ Failed to add to cart.");
    }
  };

  // ----------------- Submit Report -----------------
  const handleReportSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("productId", id);
    formData.append("sellerUsername", product.seller.username);
    formData.append("reason", reportForm.reason);
    formData.append("isPaymentRelated", reportForm.isPaymentRelated);
    for (const file of reportForm.files) formData.append("files", file);

    try {
      await axios.post(`/api/report`, formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "multipart/form-data",
        },
      });
      alert("✅ Report submitted successfully!");
      setIsReporting(false);
      setReportForm({ reason: "", isPaymentRelated: false, files: [] });
    } catch (err) {
      console.error(err);
      alert("❌ Failed to submit report.");
    }
  };

  return (
    <div className="p-6 mt-20"> {/* margin top for navbar */}
      {/* Media Carousel */}
      <div className="relative w-full max-w-xl mx-auto">
        {media.length > 0 && (
          <div>
            {media[currentIndex].includes("video") ? (
              <video
                src={media[currentIndex]}
                controls
                className="w-full rounded-lg shadow"
              />
            ) : (
              <img
                src={media[currentIndex]}
                alt="Product"
                className="w-full rounded-lg shadow"
              />
            )}
          </div>
        )}
        <div className="flex justify-between mt-2">
          <button
            disabled={currentIndex === 0}
            onClick={() => setCurrentIndex((prev) => prev - 1)}
            className="px-4 py-2 bg-gray-200 rounded"
          >
            Prev
          </button>
          <button
            disabled={currentIndex === media.length - 1}
            onClick={() => setCurrentIndex((prev) => prev + 1)}
            className="px-4 py-2 bg-gray-200 rounded"
          >
            Next
          </button>
        </div>
      </div>

      {/* Product Info */}
      <h1 className="text-2xl font-bold mt-4">{product.title}</h1>
      <p className="text-gray-700">{product.description}</p>
      <p className="text-lg font-semibold mt-2">${product.price}</p>

      {/* Seller Info */}
      <div className="mt-3">
        <p className="text-sm">
          Sold by:{" "}
          <Link
            to={`/profile/${product.seller._id}`}
            className="text-indigo-600 hover:underline"
          >
            @{product.seller.username}
          </Link>
        </p>
      </div>

      {/* Action Buttons */}
      <div className="mt-5 space-x-3">
        <button
          onClick={async () => {
            const res = await axios.post(
              `/api/chats/product/${id}`,
              {},
              {
                headers: {
                  Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
              }
            );
            navigate(`/chat/${res.data._id}?product=${id}`);
          }}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          💬 Contact Seller
        </button>

        <button
          onClick={handleAddToCart}
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
          🛒 Add to Cart
        </button>

        <button
          onClick={() => setIsReporting(true)}
          className="bg-red-500 text-white px-4 py-2 rounded"
        >
          ⚠️ Report
        </button>

        <button
          onClick={async () => {
            await axios.post(
              `/api/users/favorites/${id}`,
              {},
              {
                headers: {
                  Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
              }
            );
            alert("❤️ Added to Favorites!");
          }}
          className="bg-pink-500 text-white px-3 py-2 rounded"
        >
          ❤️ Favorite
        </button>
      </div>

      {/* Report Modal */}
      {isReporting && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <form
            onSubmit={handleReportSubmit}
            className="bg-white dark:bg-gray-800 p-6 rounded-lg w-full max-w-lg shadow-lg"
          >
            <h2 className="text-xl font-semibold mb-4">Report Product</h2>
            <textarea
              placeholder="Describe the issue..."
              className="w-full p-3 border rounded mb-3"
              value={reportForm.reason}
              onChange={(e) =>
                setReportForm({ ...reportForm, reason: e.target.value })
              }
              required
            />
            <label className="flex items-center space-x-2 mb-3">
              <input
                type="checkbox"
                checked={reportForm.isPaymentRelated}
                onChange={(e) =>
                  setReportForm({
                    ...reportForm,
                    isPaymentRelated: e.target.checked,
                  })
                }
              />
              <span>Is this payment related?</span>
            </label>
            <input
              type="file"
              multiple
              accept="image/*,video/*"
              onChange={(e) =>
                setReportForm({ ...reportForm, files: Array.from(e.target.files) })
              }
              className="mb-3"
            />
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setIsReporting(false)}
                className="px-4 py-2 bg-gray-300 rounded"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-red-600 text-white rounded"
              >
                Submit Report
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Related Products */}
      <div className="mt-12">
        <h3 className="text-xl font-bold mb-4">Related Products</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {related.map((item) => (
            <div
              key={item._id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 hover:shadow-lg"
            >
              <img
                src={item.images[0]}
                alt={item.title}
                className="rounded-lg mb-3 h-40 w-full object-cover"
              />
              <h4 className="font-semibold">{item.title}</h4>
              <p className="text-sm text-gray-600">${item.price}</p>
              <button
                onClick={() => navigate(`/product/${item._id}`)}
                className="mt-2 text-indigo-600 text-sm hover:underline"
              >
                View Product
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ProductDetail;
