// app/routes/page.tsx
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";

export const revalidate = 0;

export default async function RoutesListPage() {
  const { data: routes, error } = await supabase
    .from("delivery_routes")
    .select(`*, delivery_partners(name), warehouses(name)`)
    .order("created_at", { ascending: false });

  if (error) return <p className="p-8 text-red-500">Error loading routes.</p>;

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Planned Delivery Routes</h1>
      <div className="space-y-4">
        {routes.map((route) => (
          <Link
            href={`/routes/${route.id}`}
            key={route.id}
            className="block p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
          >
            <p className="font-semibold text-blue-600">
              Route for {route.delivery_partners?.name}
            </p>
            <p className="text-sm text-gray-600">
              From: {route.warehouses?.name}
            </p>
            <p className="text-sm text-gray-500">
              Planned on: {new Date(route.created_at).toLocaleString()}
            </p>
          </Link>
        ))}
        {routes.length === 0 && <p>No routes planned yet.</p>}
      </div>
    </div>
  );
}
