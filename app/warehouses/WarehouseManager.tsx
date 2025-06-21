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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-800 mb-2">
            Warehouse Management
          </h1>
          <p className="text-slate-600">
            Manage your warehouse locations and inventory centers
          </p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Form and Map Column */}
          <div className="xl:col-span-1 space-y-6">
            {/* Add Warehouse Form */}
            <div className="bg-white backdrop-blur-sm bg-opacity-90 p-8 rounded-2xl shadow-xl border border-slate-200/50">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mr-4">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-slate-800">
                  Add New Warehouse
                </h2>
              </div>

              <form onSubmit={handleAddSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700">
                    Warehouse Name
                  </label>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter warehouse name"
                    required
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder-slate-400"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700">
                    Location Coordinates
                  </label>
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                    <p className="text-sm text-slate-600 mb-1">
                      Click on the map below to set location
                    </p>
                    <div className="flex items-center space-x-4 text-sm">
                      <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-lg font-medium">
                        Lat: {position.lat.toFixed(4)}
                      </span>
                      <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-lg font-medium">
                        Lng: {position.lng.toFixed(4)}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transform transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-lg"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Adding Warehouse...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center space-x-2">
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                        />
                      </svg>
                      <span>Add Warehouse</span>
                    </div>
                  )}
                </button>
              </form>
            </div>

            {/* Map Container */}
            <div className="bg-white backdrop-blur-sm bg-opacity-90 p-6 rounded-2xl shadow-xl border border-slate-200/50">
              <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
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
                Select Location
              </h3>
              <div className="rounded-xl overflow-hidden border border-slate-200 shadow-inner">
                <DynamicMap
                  position={position}
                  onPositionChange={setPosition}
                />
              </div>
            </div>
          </div>

          {/* Warehouse List Column */}
          <div className="xl:col-span-2">
            <div className="bg-white backdrop-blur-sm bg-opacity-90 rounded-2xl shadow-xl border border-slate-200/50 overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-slate-50 to-slate-100 px-8 py-6 border-b border-slate-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center mr-4">
                      <svg
                        className="w-5 h-5 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                        />
                      </svg>
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-slate-800">
                        Warehouse Locations
                      </h2>
                      <p className="text-slate-600 text-sm">
                        {initialWarehouses.length}{" "}
                        {initialWarehouses.length === 1
                          ? "warehouse"
                          : "warehouses"}{" "}
                        configured
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="px-8 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                        <div className="flex items-center space-x-2">
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                            />
                          </svg>
                          <span>Warehouse Name</span>
                        </div>
                      </th>
                      <th className="px-8 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                        <div className="flex items-center space-x-2">
                          <svg
                            className="w-4 h-4"
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
                          <span>Coordinates</span>
                        </div>
                      </th>
                      <th className="px-8 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                        <div className="flex items-center space-x-2">
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                            />
                          </svg>
                          <span>Actions</span>
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {initialWarehouses.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="px-8 py-12 text-center">
                          <div className="flex flex-col items-center space-y-3">
                            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center">
                              <svg
                                className="w-8 h-8 text-slate-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                                />
                              </svg>
                            </div>
                            <div className="text-center">
                              <h3 className="text-lg font-semibold text-slate-800">
                                No warehouses yet
                              </h3>
                              <p className="text-slate-500">
                                Add your first warehouse to get started
                              </p>
                            </div>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      initialWarehouses.map((w, index) => (
                        <tr
                          key={w.id}
                          className="hover:bg-slate-50 transition-colors duration-150"
                        >
                          <td className="px-8 py-6">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-purple-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                                {index + 1}
                              </div>
                              <div>
                                <div className="text-sm font-semibold text-slate-900">
                                  {w.name}
                                </div>
                                <div className="text-xs text-slate-500">
                                  Warehouse #{index + 1}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-8 py-6">
                            {w.location ? (
                              <div className="flex flex-col space-y-1">
                                <div className="flex items-center space-x-2">
                                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-md text-xs font-medium">
                                    {w.location.lat.toFixed(4)}
                                  </span>
                                  <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-md text-xs font-medium">
                                    {w.location.lng.toFixed(4)}
                                  </span>
                                </div>
                              </div>
                            ) : (
                              <span className="bg-slate-100 text-slate-500 px-3 py-1 rounded-md text-xs font-medium">
                                No location set
                              </span>
                            )}
                          </td>
                          <td className="px-8 py-6">
                            <button
                              onClick={() => handleDelete(w.id)}
                              className="inline-flex items-center space-x-2 px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 hover:text-red-800 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all duration-200 text-sm font-medium group"
                            >
                              <svg
                                className="w-4 h-4 group-hover:scale-110 transition-transform"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                              </svg>
                              <span>Delete</span>
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
