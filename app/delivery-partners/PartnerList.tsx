// app/delivery-partners/PartnerList.tsx
"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

type Partner = {
  id: string;
  name: string;
  vehicle_type: string | null;
  max_capacity_kg: number;
};

export function PartnerList({
  initialPartners,
}: {
  initialPartners: Partner[];
}) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState<Partner | null>(null);

  // --- Form State ---
  const [name, setName] = useState("");
  const [vehicleType, setVehicleType] = useState("");
  const [capacity, setCapacity] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // --- Handlers ---
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure?")) return;
    await fetch(`/api/delivery-partners/${id}`, { method: "DELETE" });
    router.refresh();
  };

  const handleEditClick = (partner: Partner) => {
    setIsEditing(partner);
  };

  const handleEditSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!isEditing) return;
    await fetch(`/api/delivery-partners/${isEditing.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: isEditing.name,
        vehicle_type: isEditing.vehicle_type,
        max_capacity_kg: isEditing.max_capacity_kg,
      }),
    });
    setIsEditing(null);
    router.refresh();
  };

  const handleAddSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    await fetch("/api/delivery-partners", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        vehicle_type: vehicleType,
        max_capacity_kg: capacity,
      }),
    });
    setName("");
    setVehicleType("");
    setCapacity("");
    setIsLoading(false);
    router.refresh();
  };

  return (
    <>
      {/* Add Form */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-2xl font-semibold mb-4 text-gray-700">
          Add New Partner
        </h2>
        <form onSubmit={handleAddSubmit} className="space-y-4">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Partner Name*"
            required
            className="w-full p-2 border rounded"
          />
          <input
            value={vehicleType}
            onChange={(e) => setVehicleType(e.target.value)}
            placeholder="Vehicle Type (e.g., Van, Truck)"
            className="w-full p-2 border rounded"
          />
          <input
            type="number"
            value={capacity}
            onChange={(e) => setCapacity(e.target.value)}
            placeholder="Max Capacity (kg)*"
            required
            className="w-full p-2 border rounded"
          />
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-300"
          >
            {isLoading ? "Adding..." : "Add Partner"}
          </button>
        </form>
      </div>

      {/* List */}
      <div className="mt-10 bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                Name
              </th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                Vehicle
              </th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                Capacity (kg)
              </th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {initialPartners.map((partner) => (
              <tr key={partner.id} className="border-b hover:bg-gray-50">
                <td className="px-5 py-4">{partner.name}</td>
                <td className="px-5 py-4">{partner.vehicle_type || "N/A"}</td>
                <td className="px-5 py-4">{partner.max_capacity_kg}</td>
                <td className="px-5 py-4">
                  <button
                    onClick={() => handleEditClick(partner)}
                    className="text-indigo-600 hover:text-indigo-900 mr-4"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(partner.id)}
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

      {/* Edit Modal */}
      {isEditing && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center">
          <form
            onSubmit={handleEditSubmit}
            className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md space-y-4"
          >
            <h3 className="text-xl font-semibold">Edit Partner</h3>
            <input
              value={isEditing.name}
              onChange={(e) =>
                setIsEditing({ ...isEditing, name: e.target.value })
              }
              className="w-full p-2 border rounded"
            />
            <input
              value={isEditing.vehicle_type || ""}
              onChange={(e) =>
                setIsEditing({ ...isEditing, vehicle_type: e.target.value })
              }
              className="w-full p-2 border rounded"
            />
            <input
              type="number"
              value={isEditing.max_capacity_kg}
              onChange={(e) =>
                setIsEditing({
                  ...isEditing,
                  max_capacity_kg: Number(e.target.value),
                })
              }
              className="w-full p-2 border rounded"
            />
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setIsEditing(null)}
                className="px-4 py-2 bg-gray-300 rounded"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
