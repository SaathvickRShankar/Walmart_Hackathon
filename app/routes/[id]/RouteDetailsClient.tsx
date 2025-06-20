// app/routes/[id]/RouteDetailsClient.tsx
"use client";

import DynamicRouteMap from "./DynamicRouteMap";

// This is a helper function to parse the clean JSON data from the database
function parseGeoJsonPoint(geoJson: any): { lat: number; lng: number } | null {
  if (!geoJson || geoJson.type !== "Point" || !geoJson.coordinates) return null;
  return { lat: geoJson.coordinates[1], lng: geoJson.coordinates[0] };
}

// The component receives the raw `route` data as a prop
export function RouteDetailsClient({ route }: { route: any }) {
  if (!route) {
    return <div className="p-8 text-red-500">Route data is not available.</div>;
  }

  // All parsing and data preparation happens here, on the client
  const startLocation = parseGeoJsonPoint(route.warehouse_location);
  const stops = (route.stops || [])
    .map((stop: any) => ({
      ...stop,
      location: parseGeoJsonPoint(stop.location),
    }))
    .filter((stop: any) => stop.location);

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">Delivery Route Details</h1>
      <p className="text-gray-600 mb-1">
        Partner:{" "}
        <span className="font-semibold">
          {route.partner_name} ({route.partner_vehicle})
        </span>
      </p>
      <p className="text-gray-600 mb-6">
        Dispatched from:{" "}
        <span className="font-semibold">{route.warehouse_name}</span>
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          {/* We now pass the prepared data to our dynamic map */}
          <DynamicRouteMap
            routeGeometry={route.route_geometry}
            startLocation={startLocation}
            stops={stops}
          />
        </div>
        <div className="md:col-span-1 bg-white p-4 rounded-lg shadow-md h-fit">
          <h2 className="text-xl font-semibold mb-4 border-b pb-2">Stops</h2>
          <ol className="list-decimal list-inside space-y-4">
            {(route.stops || []).map((stop: any) => (
              <li key={stop.stop_number}>
                <span className="font-semibold">{stop.customer_name}</span>
                <p className="text-sm text-gray-600">{stop.delivery_address}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}
