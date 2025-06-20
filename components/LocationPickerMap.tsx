// components/LocationPickerMap.tsx
"use client";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix for default icon issue with webpack
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

L.Icon.Default.mergeOptions({
  iconUrl: markerIcon.src,
  iconRetinaUrl: markerIcon2x.src,
  shadowUrl: markerShadow.src,
});

type Position = { lat: number; lng: number };

interface LocationPickerMapProps {
  position: Position;
  onPositionChange: (position: Position) => void;
}

// A helper component to handle map clicks
function MapClickHandler({
  onPositionChange,
}: {
  onPositionChange: (pos: Position) => void;
}) {
  useMapEvents({
    click(e) {
      onPositionChange(e.latlng);
    },
  });
  return null;
}

export default function LocationPickerMap({
  position,
  onPositionChange,
}: LocationPickerMapProps) {
  return (
    <MapContainer
      center={position}
      zoom={13}
      style={{ height: "400px", width: "100%", borderRadius: "8px" }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      <Marker position={position} />
      <MapClickHandler onPositionChange={onPositionChange} />
    </MapContainer>
  );
}
