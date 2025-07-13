// app/orders/OrderForm.tsx
"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

type Product = { id: string; name: string; sku: string };
type CartItem = { product_id: string; quantity: number; name: string };

export function OrderForm({ products }: { products: Product[] }) {
  const router = useRouter();
  const [customerName, setCustomerName] = useState("");
  // This is now optional, for display/reference only
  const [address, setAddress] = useState("");
  // --- NEW STATE FOR COORDINATES ---
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");

  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const handleAddToCart = () => {
    if (!selectedProduct || quantity <= 0) return;
    const product = products.find((p) => p.id === selectedProduct);
    if (product) {
      setCart((prev) => [
        ...prev,
        { product_id: product.id, quantity, name: product.name },
      ]);
      setSelectedProduct("");
      setQuantity(1);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) {
      alert("Please add items to the order.");
      return;
    }
    // Simple validation for lat/lng
    if (!lat || !lng) {
      alert("Latitude and Longitude are required.");
      return;
    }
    setIsLoading(true);

    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customer_name: customerName,
        delivery_address: address, // Sending the optional text address
        // --- SENDING THE COORDINATES DIRECTLY ---
        delivery_location: {
          lat: parseFloat(lat),
          lng: parseFloat(lng),
        },
        items: cart.map(({ product_id, quantity }) => ({
          product_id,
          quantity,
        })),
      }),
    });

    if (res.ok) {
      alert("Order created!");
      router.push("/outbound");
    } else {
      const { error } = await res.json();
      alert(`Failed to create order: ${error}`);
    }
    setIsLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto bg-gradient-to-br from-white to-gray-50 p-8 rounded-2xl shadow-2xl border border-gray-100">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">
          Create New Order
        </h2>
        <p className="text-gray-600">
          Fill in the details to create a new order
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Customer Information Section */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
            <svg
              className="w-5 h-5 mr-2 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
            Customer Information
          </h3>

          <div className="relative">
            <input
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Customer Name*"
              required
              className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 outline-none text-gray-700 placeholder-gray-400"
            />
            <div className="absolute right-4 top-4 text-red-500">*</div>
          </div>
        </div>

        {/* Delivery Information Section */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
            <svg
              className="w-5 h-5 mr-2 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            Delivery Information
          </h3>

          <div className="space-y-4">
            <input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Delivery Address (e.g., House No, Street)"
              className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-200 outline-none text-gray-700 placeholder-gray-400"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <input
                  type="number"
                  step="any"
                  value={lat}
                  onChange={(e) => setLat(e.target.value)}
                  placeholder="Delivery Latitude*"
                  required
                  className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-200 outline-none text-gray-700 placeholder-gray-400"
                />
                <div className="absolute right-4 top-4 text-red-500">*</div>
              </div>
              <div className="relative">
                <input
                  type="number"
                  step="any"
                  value={lng}
                  onChange={(e) => setLng(e.target.value)}
                  placeholder="Delivery Longitude*"
                  required
                  className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-200 outline-none text-gray-700 placeholder-gray-400"
                />
                <div className="absolute right-4 top-4 text-red-500">*</div>
              </div>
            </div>
          </div>
        </div>

        {/* Order Items Section */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
            <svg
              className="w-5 h-5 mr-2 text-purple-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              />
            </svg>
            Order Items
          </h3>

          <div className="bg-gray-50 p-4 rounded-lg mb-4">
            <div className="flex flex-col md:flex-row gap-3">
              <select
                value={selectedProduct}
                onChange={(e) => setSelectedProduct(e.target.value)}
                className="flex-grow p-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200 outline-none text-gray-700 bg-white"
              >
                <option value="">Select a Product</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.sku})
                  </option>
                ))}
              </select>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                min="1"
                className="w-full md:w-24 p-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200 outline-none text-gray-700"
              />
              <button
                type="button"
                onClick={handleAddToCart}
                className="px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                Add to Cart
              </button>
            </div>
          </div>

          {cart.length > 0 && (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-600">
                  Cart Items
                </span>
                <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                  {cart.length} item{cart.length !== 1 ? "s" : ""}
                </span>
              </div>
              <ul className="space-y-2 max-h-40 overflow-y-auto">
                {cart.map((item, i) => (
                  <li
                    key={i}
                    className="flex justify-between items-center p-3 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg border-l-4 border-purple-400"
                  >
                    <span className="font-medium text-gray-700">
                      {item.name}
                    </span>
                    <span className="bg-purple-200 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">
                      Qty: {item.quantity}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading || cart.length === 0}
          className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Creating Order...
            </div>
          ) : (
            "Create Order"
          )}
        </button>
      </form>
    </div>
  );
}
