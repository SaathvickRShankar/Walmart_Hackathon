// app/outbound/OutboundManager.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

// Extend types if needed from DB schema
type Order = {
  id: string;
  customer_name: string;
  delivery_address: string | null;
  order_items: any[];
};
type Warehouse = { id: string; name: string };

export function OutboundManager({
  pendingOrders,
  warehouses,
}: {
  pendingOrders: Order[];
  warehouses: Warehouse[];
}) {
  const router = useRouter();
  const [selectedWarehouse, setSelectedWarehouse] = useState(
    warehouses[0]?.id || ""
  );
  const [isLoading, setIsLoading] = useState(false);

  const handleOptimize = async () => {
    if (!selectedWarehouse) {
      alert("Please select a warehouse to dispatch from.");
      return;
    }
    setIsLoading(true);
    const res = await fetch("/api/optimize-routes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ warehouseId: selectedWarehouse }),
    });

    if (res.ok) {
      const data = await res.json();
      alert(data.message);
      router.refresh();
    } else {
      const data = await res.json();
      alert(`Optimization failed: ${data.error}`);
    }
    setIsLoading(false);
  };

  return (
    <>
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-2xl font-semibold mb-4">Plan Deliveries</h2>
        <div className="flex gap-4 items-center">
          <select
            value={selectedWarehouse}
            onChange={(e) => setSelectedWarehouse(e.target.value)}
            className="p-2 border rounded flex-grow"
          >
            <option value="">Select a Dispatch Warehouse</option>
            {warehouses.map((w) => (
              <option key={w.id} value={w.id}>
                {w.name}
              </option>
            ))}
          </select>
          <button
            onClick={handleOptimize}
            disabled={isLoading || !selectedWarehouse}
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
          >
            {isLoading ? "Optimizing..." : "Plan Optimal Routes"}
          </button>
        </div>
      </div>

      <h3 className="text-xl font-semibold mb-4">
        Pending Orders ({pendingOrders.length})
      </h3>
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="min-w-full">
          {/* Table to show pending orders */}
          <thead className="bg-gray-100">
            <tr>
              <th className="p-4 text-left">Order ID</th>
              <th className="p-4 text-left">Customer</th>
              <th className="p-4 text-left">Items</th>
            </tr>
          </thead>
          <tbody>
            {pendingOrders.map((order) => (
              <tr key={order.id} className="border-b">
                <td className="p-4 text-xs font-mono">{order.id}</td>
                <td className="p-4">{order.customer_name}</td>
                <td className="p-4">
                  {order.order_items.reduce(
                    (sum, item) => sum + item.quantity,
                    0
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
