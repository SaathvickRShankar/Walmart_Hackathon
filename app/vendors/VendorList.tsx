// app/vendors/VendorList.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

// Define a type for our vendor object for better TypeScript support
type Vendor = {
  id: string;
  name: string;
  contact_person: string | null;
  contact_email: string;
};

export function VendorList({ initialVendors }: { initialVendors: Vendor[] }) {
  const router = useRouter();
  const [vendors, setVendors] = useState<Vendor[]>(initialVendors);
  const [isEditing, setIsEditing] = useState<Vendor | null>(null);

  // --- Delete Handler ---
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this vendor?")) return;

    const res = await fetch(`/api/vendors/${id}`, { method: "DELETE" });
    if (res.ok) {
      // Refresh data from server to be safe
      router.refresh();
    } else {
      alert("Failed to delete vendor.");
    }
  };

  // --- Edit Handlers ---
  const handleEditClick = (vendor: Vendor) => {
    setIsEditing({ ...vendor });
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isEditing) {
      setIsEditing({ ...isEditing, [e.target.name]: e.target.value });
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isEditing) return;

    const res = await fetch(`/api/vendors/${isEditing.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: isEditing.name,
        contact_person: isEditing.contact_person,
        contact_email: isEditing.contact_email,
      }),
    });

    if (res.ok) {
      setIsEditing(null);
      router.refresh();
    } else {
      alert("Failed to update vendor.");
    }
  };

  return (
    <div className="mt-10">
      <h2 className="text-2xl font-semibold mb-4 text-gray-700">
        Existing Vendors
      </h2>
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full leading-normal">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Name
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Contact
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Email
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {initialVendors && initialVendors.length > 0 ? (
              initialVendors.map((vendor) => (
                <tr
                  key={vendor.id}
                  className="border-b border-gray-200 hover:bg-gray-50"
                >
                  <td className="px-5 py-4 text-sm bg-white">{vendor.name}</td>
                  <td className="px-5 py-4 text-sm bg-white">
                    {vendor.contact_person || "N/A"}
                  </td>
                  <td className="px-5 py-4 text-sm bg-white">
                    {vendor.contact_email}
                  </td>
                  <td className="px-5 py-4 text-sm bg-white">
                    <button
                      onClick={() => handleEditClick(vendor)}
                      className="text-indigo-600 hover:text-indigo-900 mr-4"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(vendor.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="text-center py-10 text-gray-500">
                  No vendors found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* --- Edit Modal --- */}
      {isEditing && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
          <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
            <h3 className="text-xl font-semibold mb-4">Edit Vendor</h3>
            <form onSubmit={handleEditSubmit}>
              <div className="space-y-4">
                <input
                  name="name"
                  value={isEditing.name}
                  onChange={handleEditChange}
                  className="w-full p-2 border border-gray-300 rounded"
                />
                <input
                  name="contact_person"
                  value={isEditing.contact_person || ""}
                  onChange={handleEditChange}
                  className="w-full p-2 border border-gray-300 rounded"
                  placeholder="Contact Person"
                />
                <input
                  name="contact_email"
                  type="email"
                  value={isEditing.contact_email}
                  onChange={handleEditChange}
                  className="w-full p-2 border border-gray-300 rounded"
                />
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsEditing(null)}
                  className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
