// app/warehouses/WarehouseManager.tsx
"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import DynamicMap from "@/components/DynamicMap"; // Our dynamically loaded map

type Position = { lat: number; lng: number };
type Warehouse = {
  id: string;
  name: string;
  location: Position | null;
};

export function WarehouseManager({
  initialWarehouses,
}: {
  initialWarehouses: Warehouse[];
}) {
  const router = useRouter();
  const [name, setName] = useState("");
  // Default location (e.g., Walmart HQ in Bentonville)
  const [position, setPosition] = useState<Position>({
    lat: 36.3729,
    lng: -94.2088,
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleAddSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const res = await fetch("/api/warehouses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, location: position }),
    });
    if (res.ok) {
      setName("");
      router.refresh();
    } else {
      alert("Failed to add warehouse");
    }
    setIsLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure?")) return;
    await fetch(`/api/warehouses/${id}`, { method: "DELETE" });
    router.refresh();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Form and Map Column */}
      <div className="lg:col-span-1 space-y-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4">Add New Warehouse</h2>
          <form onSubmit={handleAddSubmit} className="space-y-4">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Warehouse Name*"
              required
              className="w-full p-2 border rounded"
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location (Click on map to set)
              </label>
              <p className="text-xs text-gray-500">
                Lat: {position.lat.toFixed(4)}, Lng: {position.lng.toFixed(4)}
              </p>
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-300"
            >
              {isLoading ? "Adding..." : "Add Warehouse"}
            </button>
          </form>
        </div>
        <DynamicMap position={position} onPositionChange={setPosition} />
      </div>

      {/* List Column */}
      <div className="lg:col-span-2">
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-4 text-left text-xs font-semibold text-gray-600 uppercase">
                  Name
                </th>
                <th className="p-4 text-left text-xs font-semibold text-gray-600 uppercase">
                  Coordinates
                </th>
                <th className="p-4 text-left text-xs font-semibold text-gray-600 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {initialWarehouses.map((w) => (
                <tr key={w.id} className="border-b hover:bg-gray-50">
                  <td className="p-4">{w.name}</td>
                  <td className="p-4 text-sm text-gray-600">
                    {w.location
                      ? `${w.location.lat.toFixed(4)}, ${w.location.lng.toFixed(
                          4
                        )}`
                      : "N/A"}
                  </td>
                  <td className="p-4">
                    <button
                      onClick={() => handleDelete(w.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
