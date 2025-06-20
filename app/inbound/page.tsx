// app/inbound/page.tsx
import { supabase } from "@/lib/supabaseClient";
import { InboundManager } from "./InboundManager";

export const revalidate = 0;

export default async function InboundPage() {
  // Fetch all data in parallel for efficiency
  const [shipmentsRes, vendorsRes, productsRes, warehousesRes] =
    await Promise.all([
      supabase
        .from("inbound_shipments")
        .select("*, vendors(name), products(name), warehouses(name)")
        .order("eta"),
      supabase.from("vendors").select("id, name").order("name"),
      supabase.from("products").select("id, name").order("name"),
      supabase.from("warehouses").select("id, name").order("name"),
    ]);

  const { data: shipments, error: shipmentsError } = shipmentsRes;
  const { data: vendors, error: vendorsError } = vendorsRes;
  const { data: products, error: productsError } = productsRes;
  const { data: warehouses, error: warehousesError } = warehousesRes;

  if (shipmentsError || vendorsError || productsError || warehousesError) {
    return (
      <p className="p-8 text-red-500">Error loading inbound logistics data.</p>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">
        Inbound Shipments
      </h1>
      <InboundManager
        initialShipments={shipments || []}
        vendors={vendors || []}
        products={products || []}
        warehouses={warehouses || []}
      />
    </div>
  );
}
