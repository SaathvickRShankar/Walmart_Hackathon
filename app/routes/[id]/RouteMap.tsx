// app/routes/[id]/RouteMap.tsx
"use client";

import {
  MapContainer,
  TileLayer,
  Marker,
  Polyline,
  Popup,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
// We need the compatibility CSS for icons to work reliably
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";
import "leaflet-defaulticon-compatibility";
import { LatLngExpression } from "leaflet";

// Helper to decode GraphHopper's flexible polyline format
function decode(encoded: string | null): [number, number][] {
  if (!encoded) {
    return []; // Return an empty array if the geometry is null
  }
  let len = encoded.length;
  let index = 0;
  let lat = 0;
  let lng = 0;
  let array: [number, number][] = [];

  while (index < len) {
    let b;
    let shift = 0;
    let result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    let dlat = result & 1 ? ~(result >> 1) : result >> 1;
    lat += dlat;
    shift = 0;
    result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    let dlng = result & 1 ? ~(result >> 1) : result >> 1;
    lng += dlng;
    array.push([lat * 1e-5, lng * 1e-5]);
  }
  return array;
}

// Define the shape of our props for clarity
interface RouteMapProps {
  routeGeometry: string | null;
  startLocation: { lat: number; lng: number } | null;
  stops: {
    stop_number: number;
    location: { lat: number; lng: number };
    customer_orders: { customer_name: string | null } | null;
  }[];
}

export function RouteMap({
  routeGeometry,
  startLocation,
  stops,
}: RouteMapProps) {
  if (!startLocation) {
    return (
      <div className="h-[600px] w-full flex items-center justify-center bg-gray-200 rounded-lg">
        Map requires a start location.
      </div>
    );
  }

  const polyline: LatLngExpression[] = decode(routeGeometry);
  const hasGeometry = polyline.length > 0;

  // --- THIS IS THE FIX ---
  // We create a props object for the MapContainer.
  // If we have geometry, we use 'bounds'.
  // If not, we fall back to 'center' and 'zoom' to prevent crashing.
  const mapProps: any = {
    style: { height: "600px", width: "100%", borderRadius: "8px" },
  };

  if (hasGeometry) {
    mapProps.bounds = polyline;
  } else {
    mapProps.center = startLocation;
    mapProps.zoom = 13;
  }
  // --- END FIX ---

  return (
    <MapContainer {...mapProps}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />

      {/* Only render the Polyline if it exists */}
      {hasGeometry && (
        <Polyline pathOptions={{ color: "blue" }} positions={polyline} />
      )}

      {/* Warehouse Marker */}
      <Marker position={startLocation}>
        <Popup>Warehouse (Start/End)</Popup>
      </Marker>

      {/* Stop Markers */}
      {stops.map((stop) => (
        <Marker key={stop.stop_number} position={stop.location}>
          <Popup>
            <b>Stop {stop.stop_number}:</b>{" "}
            {stop.customer_orders?.customer_name}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
