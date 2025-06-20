// app/products/ProductManager.tsx
"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

type Product = {
  id: string;
  sku: string;
  name: string;
  description: string | null;
  weight_kg: number;
  vendor_id: string | null;
  vendors: { name: string } | null;
};
type Vendor = { id: string; name: string };

export function ProductManager({
  initialProducts,
  vendors,
}: {
  initialProducts: Product[];
  vendors: Vendor[];
}) {
  const router = useRouter();
  const [sku, setSku] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [weight, setWeight] = useState("");
  const [vendorId, setVendorId] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // We'll create a simple API for this
    await fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sku,
        name,
        description,
        weight_kg: weight,
        vendor_id: vendorId || null,
      }),
    });
    // Reset form
    [setSku, setName, setDescription, setWeight, setVendorId].forEach((f) =>
      f("")
    );
    setIsLoading(false);
    router.refresh();
  };

  return (
    <>
      {/* Add Form */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-2xl font-semibold mb-4">Add New Product</h2>
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <input
            value={sku}
            onChange={(e) => setSku(e.target.value)}
            placeholder="SKU*"
            required
            className="p-2 border rounded"
          />
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Product Name*"
            required
            className="p-2 border rounded"
          />
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description"
            className="p-2 border rounded"
          />
          <input
            type="number"
            step="0.01"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            placeholder="Weight (kg)*"
            required
            className="p-2 border rounded"
          />
          <select
            value={vendorId}
            onChange={(e) => setVendorId(e.target.value)}
            className="p-2 border rounded md:col-span-2"
          >
            <option value="">Select a Vendor (Optional)</option>
            {vendors.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name}
              </option>
            ))}
          </select>
          <button
            type="submit"
            disabled={isLoading}
            className="md:col-span-2 py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-300"
          >
            {isLoading ? "Adding..." : "Add Product"}
          </button>
        </form>
      </div>

      {/* List */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-4 text-left text-xs font-semibold uppercase">
                SKU
              </th>
              <th className="p-4 text-left text-xs font-semibold uppercase">
                Name
              </th>
              <th className="p-4 text-left text-xs font-semibold uppercase">
                Vendor
              </th>
              <th className="p-4 text-left text-xs font-semibold uppercase">
                Weight (kg)
              </th>
            </tr>
          </thead>
          <tbody>
            {initialProducts.map((p) => (
              <tr key={p.id} className="border-b hover:bg-gray-50">
                <td className="p-4">{p.sku}</td>
                <td className="p-4">{p.name}</td>
                <td className="p-4">{p.vendors?.name || "N/A"}</td>
                <td className="p-4">{p.weight_kg}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
