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
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";
import "leaflet-defaulticon-compatibility";
import { LatLngExpression } from "leaflet";

export function RouteMap({ routeGeometry, startLocation, stops }: any) {
  if (!startLocation) {
    return (
      <div className="h-[600px] w-full flex items-center justify-center bg-gray-200 rounded-lg">
        Map requires a start location.
      </div>
    );
  }

  // --- FINAL FIX: Directly use the coordinates from the 'points' array ---
  let polyline: LatLngExpression[] = [];
  if (routeGeometry && Array.isArray(routeGeometry)) {
    // We map over each segment in the 'points' array and extract its coordinates
    polyline = routeGeometry.flatMap(
      (segment: any) =>
        segment.coordinates.map((coord: [number, number]) => [
          coord[1],
          coord[0],
        ]) // Swap [lng, lat] to [lat, lng] for Leaflet
    );
  }
  // --- END FINAL FIX ---

  const hasGeometry = polyline.length > 0;
  const mapProps: any = {
    style: { height: "600px", width: "100%", borderRadius: "8px" },
  };
  if (hasGeometry) {
    mapProps.bounds = polyline;
  } else {
    mapProps.center = startLocation;
    mapProps.zoom = 13;
  }

  return (
    <MapContainer {...mapProps}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      {hasGeometry && (
        <Polyline
          pathOptions={{ color: "blue", weight: 5 }}
          positions={polyline}
        />
      )}
      <Marker position={startLocation}>
        <Popup>Warehouse (Start/End)</Popup>
      </Marker>
      {stops.map((stop: any) => (
        <Marker key={stop.stop_number} position={stop.location}>
          <Popup>
            <b>Stop {stop.stop_number}:</b> {stop.customer_name}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
