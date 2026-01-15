// src/components/maps/RiskMap.tsx
import type { FC } from "react";
import { MapContainer, TileLayer, Circle, Tooltip } from "react-leaflet";
import { type LatLngExpression } from "leaflet";

const center: LatLngExpression = [34.8, 36.3];

interface RiskMapProps {
  className?: string; 
}

const RiskMap: FC<RiskMapProps> = ({ className }) => {
  return (
    <div
      className={`relative w-full rounded-2xl overflow-hidden border border-border ${
        className ?? "h-64"
      }`}
    >
      <MapContainer
        center={center}
        zoom={8}
        scrollWheelZoom={false}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <Circle
          center={[34.9, 36.1]}
          radius={15000}
          pathOptions={{ color: "green", fillColor: "green", fillOpacity: 0.3 }}
        >
          <Tooltip>Low Risk Area</Tooltip>
        </Circle>

        <Circle
          center={[35.1, 36.4]}
          radius={20000}
          pathOptions={{
            color: "orange",
            fillColor: "orange",
            fillOpacity: 0.35,
          }}
        >
          <Tooltip>Medium Risk Area</Tooltip>
        </Circle>

        <Circle
          center={[35.0, 36.7]}
          radius={18000}
          pathOptions={{ color: "red", fillColor: "red", fillOpacity: 0.35 }}
        >
          <Tooltip>High Risk Area</Tooltip>
        </Circle>
      </MapContainer>
    </div>
  );
};

export default RiskMap;
