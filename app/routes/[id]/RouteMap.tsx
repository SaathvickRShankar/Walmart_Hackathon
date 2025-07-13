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

export function RouteMap({
  routeGeometry,
  trafficSegments,
  startLocation,
  stops,
}: any) {
  if (!startLocation) {
    return (
      <div className="h-[600px] w-full flex items-center justify-center bg-gray-200 rounded-lg">
        Map requires a start location.
      </div>
    );
  }

  let polyline: LatLngExpression[] = [];
  if (routeGeometry && Array.isArray(routeGeometry)) {
    polyline = routeGeometry.flatMap((segment: any) =>
      segment.coordinates.map((coord: [number, number]) => [coord[1], coord[0]])
    );
  }

  // --- NEW: Prepare the traffic polylines ---
  let trafficPolylines: LatLngExpression[][] = [];
  if (trafficSegments && Array.isArray(trafficSegments)) {
    trafficPolylines = trafficSegments.map(
      (segment: any) =>
        segment.map((coord: [number, number]) => [coord[1], coord[0]]) // Swap lng/lat
    );
  }

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

      {/* Base route in blue */}
      {hasGeometry && (
        <Polyline
          pathOptions={{ color: "blue", weight: 5, opacity: 0.7 }}
          positions={polyline}
        />
      )}

      {/* --- NEW: Render traffic segments on top in red --- */}
      {trafficPolylines.map((segment, index) => (
        <Polyline
          key={index}
          pathOptions={{ color: "red", weight: 7 }}
          positions={segment}
        />
      ))}

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
