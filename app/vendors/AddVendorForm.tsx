// app/vendors/AddVendorForm.tsx
"use client"; // This directive makes it a Client Component

import { useState } from "react";
import { useRouter } from "next/navigation";

export function AddVendorForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const res = await fetch("/api/vendors", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        contact_person: contactPerson,
        contact_email: contactEmail,
      }),
    });

    if (res.ok) {
      // Reset form
      setName("");
      setContactPerson("");
      setContactEmail("");
      // Refresh the page data without a full reload
      router.refresh();
    } else {
      const data = await res.json();
      setError(data.error || "Something went wrong.");
    }

    setIsLoading(false);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-6">
      <h2 className="text-2xl font-semibold mb-4 text-gray-700">
        Add New Vendor
      </h2>
      <form onSubmit={handleSubmit}>
        {error && (
          <p className="text-red-500 bg-red-100 p-2 rounded mb-4">{error}</p>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Vendor Name*"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full p-2 border border-gray-300 rounded"
          />
          <input
            type="email"
            placeholder="Contact Email*"
            value={contactEmail}
            onChange={(e) => setContactEmail(e.target.value)}
            required
            className="w-full p-2 border border-gray-300 rounded"
          />
          <input
            type="text"
            placeholder="Contact Person (Optional)"
            value={contactPerson}
            onChange={(e) => setContactPerson(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded md:col-span-2"
          />
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-300"
        >
          {isLoading ? "Adding..." : "Add Vendor"}
        </button>
      </form>
    </div>
  );
}
