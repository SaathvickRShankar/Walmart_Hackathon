// app/inbound/InboundManager.tsx
"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

// Define types for our props
type Shipment = {
  id: string;
  eta: string;
  quantity: number;
  status: string;
  vendors: { name: string } | null;
  products: { name: string } | null;
  warehouses: { name: string } | null;
};
type Vendor = { id: string; name: string };
type Product = { id: string; name: string };
type Warehouse = { id: string; name: string };

export function InboundManager({
  initialShipments,
  vendors,
  products,
  warehouses,
}: {
  initialShipments: Shipment[];
  vendors: Vendor[];
  products: Product[];
  warehouses: Warehouse[];
}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    vendor_id: "",
    product_id: "",
    warehouse_id: "",
    quantity: "",
    eta: "",
  });

  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleAddSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    await fetch("/api/inbound", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...formData,
        quantity: Number(formData.quantity),
        vendor_id: formData.vendor_id || null,
      }),
    });
    setIsLoading(false);
    router.refresh();
  };

  const handleReceive = async (shipmentId: string) => {
    await fetch(`/api/inbound/${shipmentId}/receive`, { method: "POST" });
    router.refresh();
  };

  return (
    <>
      {/* Add Form */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-2xl font-semibold mb-4">
          Log New Inbound Shipment
        </h2>
        <form
          onSubmit={handleAddSubmit}
          className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 items-end"
        >
          <select
            name="product_id"
            value={formData.product_id}
            onChange={handleFormChange}
            required
            className="p-2 border rounded w-full"
          >
            <option value="">Select Product*</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
          <select
            name="vendor_id"
            value={formData.vendor_id}
            onChange={handleFormChange}
            className="p-2 border rounded w-full"
          >
            <option value="">Select Vendor</option>
            {vendors.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name}
              </option>
            ))}
          </select>
          <select
            name="warehouse_id"
            value={formData.warehouse_id}
            onChange={handleFormChange}
            required
            className="p-2 border rounded w-full"
          >
            <option value="">Destination Warehouse*</option>
            {warehouses.map((w) => (
              <option key={w.id} value={w.id}>
                {w.name}
              </option>
            ))}
          </select>
          <input
            name="quantity"
            type="number"
            value={formData.quantity}
            onChange={handleFormChange}
            placeholder="Quantity*"
            required
            className="p-2 border rounded w-full"
          />
          <input
            name="eta"
            type="date"
            value={formData.eta}
            onChange={handleFormChange}
            required
            className="p-2 border rounded w-full"
          />
          <button
            type="submit"
            disabled={isLoading}
            className="lg:col-span-5 py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-300"
          >
            {isLoading ? "Logging..." : "Log Shipment"}
          </button>
        </form>
      </div>

      {/* List */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-100">
            <tr>
              {[
                "Product",
                "Vendor",
                "Warehouse",
                "Qty",
                "ETA",
                "Status",
                "Actions",
              ].map((h) => (
                <th
                  key={h}
                  className="p-4 text-left text-xs font-semibold uppercase"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {initialShipments.map((s) => (
              <tr key={s.id} className="border-b hover:bg-gray-50">
                <td className="p-4">{s.products?.name}</td>
                <td className="p-4">{s.vendors?.name || "N/A"}</td>
                <td className="p-4">{s.warehouses?.name}</td>
                <td className="p-4">{s.quantity}</td>
                <td className="p-4">{new Date(s.eta).toLocaleDateString()}</td>
                <td className="p-4">
                  <span
                    className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      s.status === "Received"
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {s.status}
                  </span>
                </td>
                <td className="p-4">
                  {s.status !== "Received" && (
                    <button
                      onClick={() => handleReceive(s.id)}
                      className="px-3 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600"
                    >
                      Receive
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
