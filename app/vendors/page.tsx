// app/vendors/page.tsx
import { supabase } from "@/lib/supabaseClient";
import { AddVendorForm } from "./AddVendorForm";
import { VendorList } from "./VendorList"; // Import our new component

// This is a Server Component, so we can fetch data directly.
export default async function VendorsPage() {
  // Revalidate this page every time it's visited
  // This ensures we always have the latest data when navigating
  // This is a good practice for dynamic data pages
  const revalidate = 0;

  // Fetch vendors from the database
  const { data: vendors, error } = await supabase
    .from("vendors")
    .select("id, name, contact_person, contact_email") // Be specific with columns
    .order("name", { ascending: true });

  if (error) {
    return (
      <p className="text-red-500 p-8">Error loading vendors: {error.message}</p>
    );
  }

  // Supabase returns `null` if the table is empty, so we default to an empty array
  const initialVendors = vendors || [];

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Manage Vendors</h1>

      <AddVendorForm />

      {/* Use the new interactive component to display the list */}
      <VendorList initialVendors={initialVendors} />
    </div>
  );
}
