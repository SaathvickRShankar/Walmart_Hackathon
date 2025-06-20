// app/orders/OrderForm.tsx
"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

type Product = { id: string; name: string; sku: string };
type CartItem = { product_id: string; quantity: number; name: string };

export function OrderForm({ products }: { products: Product[] }) {
  const router = useRouter();
  const [customerName, setCustomerName] = useState("");
  const [address, setAddress] = useState("");
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
    setIsLoading(true);
    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customer_name: customerName,
        delivery_address: address,
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
    <form
      onSubmit={handleSubmit}
      className="bg-white p-6 rounded-lg shadow-md space-y-4"
    >
      <input
        value={customerName}
        onChange={(e) => setCustomerName(e.target.value)}
        placeholder="Customer Name*"
        required
        className="w-full p-2 border rounded"
      />
      <input
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        placeholder="Full Delivery Address*"
        required
        className="w-full p-2 border rounded"
      />

      <div className="border-t pt-4">
        <h3 className="font-semibold mb-2">Order Items</h3>
        <div className="flex gap-2">
          <select
            value={selectedProduct}
            onChange={(e) => setSelectedProduct(e.target.value)}
            className="flex-grow p-2 border rounded"
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
            className="w-20 p-2 border rounded"
          />
          <button
            type="button"
            onClick={handleAddToCart}
            className="px-4 bg-gray-200 rounded hover:bg-gray-300"
          >
            Add
          </button>
        </div>
        <ul className="mt-4 space-y-2">
          {cart.map((item, i) => (
            <li key={i} className="flex justify-between p-2 bg-gray-50 rounded">
              <span>{item.name}</span>
              <span>Qty: {item.quantity}</span>
            </li>
          ))}
        </ul>
      </div>

      <button
        type="submit"
        disabled={isLoading || cart.length === 0}
        className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
      >
        {isLoading ? "Creating Order..." : "Create Order"}
      </button>
    </form>
  );
}
