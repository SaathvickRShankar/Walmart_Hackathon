// app/delivery-partners/page.tsx
import { supabase } from "@/lib/supabaseClient";
import { PartnerList } from "./PartnerList"; // We will create this

export const revalidate = 0; // Ensures fresh data on every visit

export default async function DeliveryPartnersPage() {
  const { data, error } = await supabase
    .from("delivery_partners")
    .select("*")
    .order("name", { ascending: true });

  if (error) {
    return (
      <p className="text-red-500 p-8">
        Error loading partners: {error.message}
      </p>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">
        Manage Delivery Partners
      </h1>
      <PartnerList initialPartners={data || []} />
    </div>
  );
}
