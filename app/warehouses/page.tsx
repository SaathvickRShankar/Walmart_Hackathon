// app/warehouses/page.tsx
import { supabase } from "@/lib/supabaseClient";
import { WarehouseManager } from "./WarehouseManager";

export const revalidate = 0;

// Define the expected shape of the location from our new function
type GeoJsonPoint = {
  type: "Point";
  coordinates: [number, number]; // [lng, lat]
};

export default async function WarehousesPage() {
  // Call our new, safe database function instead of a direct table select
  const { data, error } = await supabase.rpc(
    "get_warehouses_with_json_location"
  );

  if (error) {
    return (
      <p className="text-red-500 p-8">
        Error loading warehouses: {error.message}
      </p>
    );
  }

  // The location from the function is already JSON, but we need to map it
  // from { coordinates: [lng, lat] } to { lat, lng } for our component.
  const warehouses =
    data?.map((w) => ({
      id: w.id,
      name: w.name,
      location: w.location
        ? {
            lat: (w.location as GeoJsonPoint).coordinates[1],
            lng: (w.location as GeoJsonPoint).coordinates[0],
          }
        : null,
    })) || [];

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">
        Manage Warehouses
      </h1>
      <WarehouseManager initialWarehouses={warehouses} />
    </div>
  );
}
