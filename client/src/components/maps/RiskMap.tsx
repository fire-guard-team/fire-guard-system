// src/components/maps/RiskMap.tsx
import type { FC } from "react";
import { useEffect, useMemo, useState } from "react";
import {
  MapContainer,
  TileLayer,
  GeoJSON,
  useMap,
  LayersControl,
  LayerGroup,
  Circle,
  CircleMarker,
  Popup,
} from "react-leaflet";
import type { LatLngBoundsExpression, LatLngExpression } from "leaflet";
import L from "leaflet";
import { apiService } from "../../utils/api";

const center: LatLngExpression = [34.8, 36.3];

interface RiskMapProps {
  className?: string; 
}

type ProjectAreaResponse = {
  id: number;
  name: string;
  boundary: any; // GeoJSON geometry (object or string)
  bbox: { min_lat: number; min_lng: number; max_lat: number; max_lng: number };
};

type SectorGeo = {
  sector_id: number;
  name: string;
  status: string;
  boundary: any; // GeoJSON geometry (object or string)
};

type SensorGeo = {
  sensor_id: number;
  name: string;
  type: string;
  status: "active" | "offline" | "faulty";
  battery_level: number | null;
  last_seen: string | null;
  lat: number;
  lng: number;
  sector_id: number;
  sector_name: string;
  last_reading_at: string | null;
  last_temperature: number | null;
  last_humidity: number | null;
  last_smoke_level: number | null;
  last_aqi: number | null;
};

type MapAlerts = {
  warnings: Array<{
    sector_id: number;
    sector_name: string;
    type: "warning";
    center_lat: number;
    center_lng: number;
    radius_m: number;
  }>;
  fires: Array<{
    sector_id: number;
    sector_name: string;
    type: "fire";
    event?: any;
    center_lat: number;
    center_lng: number;
    radius_m: number;
  }>;
};

type HistoricalFire = {
  event_id: number;
  sector_id: number;
  sector_name: string;
  status: string;
  spread_level: string;
  detected_at: string;
  closed_at: string | null;
  lat: number;
  lng: number;
};

function normalizeGeoJsonGeometry(input: any): any | null {
  if (!input) return null;

  // If backend returns json as string, parse it.
  if (typeof input === "string") {
    try {
      const parsed = JSON.parse(input);
      return normalizeGeoJsonGeometry(parsed);
    } catch {
      return null;
    }
  }

  // Some DB drivers might return { type: '...', coordinates: ... } already.
  if (typeof input === "object" && typeof input.type === "string") {
    return input;
  }

  return null;
}

const WmsOverlay = ({
  url,
  layers,
  opacity = 0.45,
}: {
  url: string;
  layers: string;
  opacity?: number;
}) => {
  const map = useMap();

  useEffect(() => {
    const layer = L.tileLayer.wms(url, {
      layers,
      format: "image/png",
      transparent: true,
      opacity,
      version: "1.1.1",
      attribution: "Copernicus/ESA (Terrascope) NDVI",
    });
    layer.addTo(map);
    return () => {
      map.removeLayer(layer);
    };
  }, [map, url, layers, opacity]);

  return null;
};

const FitAndRender = ({
  projectArea,
  sectors,
  sensors,
  alerts,
  historicalFires,
}: {
  projectArea: ProjectAreaResponse | null;
  sectors: SectorGeo[];
  sensors: SensorGeo[];
  alerts: MapAlerts | null;
  historicalFires: HistoricalFire[];
}) => {
  const map = useMap();

  const bounds = useMemo<LatLngBoundsExpression | null>(() => {
    if (!projectArea) return null;
    return [
      [projectArea.bbox.min_lat, projectArea.bbox.min_lng],
      [projectArea.bbox.max_lat, projectArea.bbox.max_lng],
    ];
  }, [projectArea]);

  useEffect(() => {
    if (!bounds) return;
    map.fitBounds(bounds, { padding: [24, 24] });
  }, [bounds, map]);

  const projectFeature = useMemo(() => {
    const geom = normalizeGeoJsonGeometry(projectArea?.boundary);
    if (!geom) return null;
    return {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          properties: { name: projectArea?.name },
          geometry: geom,
        },
      ],
    };
  }, [projectArea]);

  const sectorFeatures = useMemo(() => {
    const features = sectors
      .map((s) => {
        const geom = normalizeGeoJsonGeometry(s.boundary);
        if (!geom) return null;
        return {
          type: "Feature",
          properties: { name: s.name, status: s.status, sector_id: s.sector_id },
          geometry: geom,
        };
      })
      .filter(Boolean);

    return {
      type: "FeatureCollection",
      features,
    };
  }, [sectors]);

  const sectorStyle = (feature: any) => {
    const status = feature?.properties?.status;
    const color =
      status === "Fire"
        ? "#ef4444"
        : status === "Warning"
          ? "#f59e0b"
          : "#22c55e";
    return { color, weight: 2, fillColor: color, fillOpacity: 0.15 };
  };

  const sensorColor = (status: string) => {
    switch (status) {
      case "active":
        return "#10b981";
      case "offline":
        return "#ef4444";
      case "faulty":
        return "#f59e0b";
      default:
        return "#6b7280";
    }
  };

  return (
    <>
      <LayersControl position="topright">
        <LayersControl.BaseLayer checked name="Satellite Imagery (Esri)">
          <LayerGroup>
            <TileLayer
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              attribution="Tiles © Esri — Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community"
              maxZoom={19}
            />
            {/* Roads/transportation overlay */}
            <TileLayer
              url="https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Transportation/MapServer/tile/{z}/{y}/{x}"
              attribution="Roads © Esri"
              maxZoom={19}
              opacity={0.9}
            />
            {/* Administrative boundaries + places overlay */}
            <TileLayer
              url="https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"
              attribution="Labels © Esri"
              maxZoom={19}
              opacity={1}
            />
            {/* Extra reference overlay (more labels/places where available) */}
            <TileLayer
              url="https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Reference_Overlay/MapServer/tile/{z}/{y}/{x}"
              attribution="Reference © Esri"
              maxZoom={19}
              opacity={1}
            />
          </LayerGroup>
        </LayersControl.BaseLayer>

        <LayersControl.Overlay checked name="Vegetation Cover">
          <LayerGroup>
            <WmsOverlay url="https://services.terrascope.be/wms/v2" layers="CGS_S2_NDVI" opacity={0.45} />
          </LayerGroup>
        </LayersControl.Overlay>

        <LayersControl.Overlay checked name="Project Boundary">
          <LayerGroup>
            {projectFeature && (
              <GeoJSON
                data={projectFeature as any}
                style={{ color: "#3b82f6", weight: 3, fillOpacity: 0.05 }}
              />
            )}
          </LayerGroup>
        </LayersControl.Overlay>

        <LayersControl.Overlay checked name="Sectors">
          <LayerGroup>
            {(sectorFeatures as any)?.features?.length > 0 && (
              <GeoJSON data={sectorFeatures as any} style={sectorStyle as any} />
            )}
          </LayerGroup>
        </LayersControl.Overlay>

        <LayersControl.Overlay checked name="Sensors">
          <LayerGroup>
            {sensors.map((s) => (
              <CircleMarker
                key={s.sensor_id}
                center={[s.lat, s.lng]}
                radius={7}
                pathOptions={{
                  color: sensorColor(s.status),
                  fillColor: sensorColor(s.status),
                  fillOpacity: 0.9,
                  weight: 2,
                }}
              >
                <Popup>
                  <div className="space-y-1">
                    <div className="font-semibold">{s.name}</div>
                    <div className="text-xs">Type: {s.type}</div>
                    <div className="text-xs">Sector: {s.sector_name}</div>
                    <div className="text-xs">Status: {s.status}</div>
                    {s.last_reading_at && (
                      <div className="text-xs">
                        Last reading: {new Date(s.last_reading_at).toLocaleString()}
                      </div>
                    )}
                    <div className="text-xs">
                      Temp: {s.last_temperature ?? "-"} °C • Humidity: {s.last_humidity ?? "-"}% • Smoke:{" "}
                      {s.last_smoke_level ?? "-"} • AQI: {s.last_aqi ?? "-"}
                    </div>
                    {s.last_seen && (
                      <div className="text-xs">
                        Last seen: {new Date(s.last_seen).toLocaleString()}
                      </div>
                    )}
                  </div>
                </Popup>
              </CircleMarker>
            ))}
          </LayerGroup>
        </LayersControl.Overlay>

        <LayersControl.Overlay checked name="Alerts">
          <LayerGroup>
            {alerts?.warnings?.map((a) => (
              <Circle
                key={`w-${a.sector_id}`}
                center={[a.center_lat, a.center_lng]}
                radius={a.radius_m}
                pathOptions={{ color: "#f59e0b", fillColor: "#f59e0b", fillOpacity: 0.18 }}
              >
                <Popup>
                  <div className="space-y-1">
                    <div className="font-semibold">Warning</div>
                    <div className="text-xs">Sector: {a.sector_name}</div>
                  </div>
                </Popup>
              </Circle>
            ))}
            {alerts?.fires?.map((a) => (
              <Circle
                key={`f-${a.sector_id}`}
                center={[a.center_lat, a.center_lng]}
                radius={a.radius_m}
                pathOptions={{ color: "#ef4444", fillColor: "#ef4444", fillOpacity: 0.2 }}
              >
                <Popup>
                  <div className="space-y-1">
                    <div className="font-semibold">Fire</div>
                    <div className="text-xs">Sector: {a.sector_name}</div>
                    {a.event?.event_id && (
                      <div className="text-xs">Event: #{a.event.event_id}</div>
                    )}
                  </div>
                </Popup>
              </Circle>
            ))}
          </LayerGroup>
        </LayersControl.Overlay>

        <LayersControl.Overlay checked name="Historical Fires">
          <LayerGroup>
            {historicalFires.map((e) => (
              <CircleMarker
                key={e.event_id}
                center={[e.lat, e.lng]}
                radius={6}
                pathOptions={{ color: "#7c2d12", fillColor: "#7c2d12", fillOpacity: 0.8 }}
              >
                <Popup>
                  <div className="space-y-1">
                    <div className="font-semibold">Historical Fire</div>
                    <div className="text-xs">Event: #{e.event_id}</div>
                    <div className="text-xs">Sector: {e.sector_name}</div>
                    <div className="text-xs">Spread: {e.spread_level}</div>
                    <div className="text-xs">
                      Detected: {new Date(e.detected_at).toLocaleString()}
                    </div>
                    {e.closed_at && (
                      <div className="text-xs">
                        Closed: {new Date(e.closed_at).toLocaleString()}
                      </div>
                    )}
                  </div>
                </Popup>
              </CircleMarker>
            ))}
          </LayerGroup>
        </LayersControl.Overlay>
      </LayersControl>
    </>
  );
};

const RiskMap: FC<RiskMapProps> = ({ className }) => {
  const [projectArea, setProjectArea] = useState<ProjectAreaResponse | null>(null);
  const [sectors, setSectors] = useState<SectorGeo[]>([]);
  const [sensors, setSensors] = useState<SensorGeo[]>([]);
  const [alerts, setAlerts] = useState<MapAlerts | null>(null);
  const [historicalFires, setHistoricalFires] = useState<HistoricalFire[]>([]);

  useEffect(() => {
    let mounted = true;
    const loadAll = async () => {
      try {
        const area = await apiService.getCurrentProjectArea();
        const sectorGeo = await apiService.getSectorsGeo();
        const sensorGeo = await apiService.getSensorsGeo();
        const mapAlerts = await apiService.getMapAlerts();
        const history = await apiService.getHistoricalFires();
        if (!mounted) return;
        setProjectArea(area);
        setSectors(sectorGeo || []);
        setSensors(sensorGeo || []);
        setAlerts(mapAlerts || null);
        setHistoricalFires(history || []);
      } catch (e) {
        console.error("Error loading map boundaries:", e);
        if (!mounted) return;
        setProjectArea(null);
        setSectors([]);
        setSensors([]);
        setAlerts(null);
        setHistoricalFires([]);
      }
    };
    loadAll();

    // شبه فوري: تحديث طبقات sensors + alerts كل 10 ثواني
    const t = window.setInterval(async () => {
      try {
        const sensorGeo = await apiService.getSensorsGeo();
        const mapAlerts = await apiService.getMapAlerts();
        if (!mounted) return;
        setSensors(sensorGeo || []);
        setAlerts(mapAlerts || null);
      } catch (e) {
        // ignore polling errors
      }
    }, 10000);

    const onProjectAreaUpdated = () => {
      // reload boundary + sectors immediately after save
      loadAll();
    };
    window.addEventListener("project-area-updated", onProjectAreaUpdated);

    return () => {
      mounted = false;
      window.clearInterval(t);
      window.removeEventListener("project-area-updated", onProjectAreaUpdated);
    };
  }, []);

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
        <FitAndRender
          projectArea={projectArea}
          sectors={sectors}
          sensors={sensors}
          alerts={alerts}
          historicalFires={historicalFires}
        />
      </MapContainer>
    </div>
  );
};

export default RiskMap;
