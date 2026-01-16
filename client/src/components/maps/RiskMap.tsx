import type { FC } from "react";
import React, { useEffect, useMemo, useState } from "react";
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
import "leaflet-draw/dist/leaflet.draw.css";
import "leaflet-draw";
import { apiService } from "../../utils/api";

const center: LatLngExpression = [34.8, 36.3];

interface RiskMapProps {
  className?: string;
  drawingMode?: boolean;
  onPolygonDrawn?: (polygon: any) => void;
  onDrawingCanceled?: () => void;
}

type ProjectAreaResponse = {
  id: number;
  name: string;
  boundary: any;
  bbox: { min_lat: number; min_lng: number; max_lat: number; max_lng: number };
};

type SectorGeo = {
  sector_id: number;
  name: string;
  status: string;
  boundary: any;
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

  if (typeof input === "string") {
    try {
      const parsed = JSON.parse(input);
      return normalizeGeoJsonGeometry(parsed);
    } catch {
      return null;
    }
  }

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

const DrawingControls = ({
  enabled,
  onPolygonDrawn,
  onDrawingCanceled,
}: {
  enabled: boolean;
  onPolygonDrawn?: (polygon: any) => void;
  onDrawingCanceled?: () => void;
}) => {
  console.log('DrawingControls props:', { enabled, hasOnPolygonDrawn: !!onPolygonDrawn });
  const map = useMap();

  useEffect(() => {
    console.log('DrawingControls enabled changed:', enabled);
    if (!enabled) return;

    const drawControl = new (L.Control as any).Draw({
      draw: {
        polyline: false,
        polygon: {
          allowIntersection: false,
          showArea: true,
          drawError: {
            color: '#e74c3c',
            message: '<strong>خطأ:</strong> لا يمكن أن تتقاطع الحدود!'
          },
          shapeOptions: {
            color: '#3b82f6',
            weight: 2,
            fillColor: '#3b82f6',
            fillOpacity: 0.1
          }
        },
        rectangle: false,
        circle: false,
        marker: false,
        circlemarker: false,
      },
      edit: {
        featureGroup: new L.FeatureGroup(),
        remove: false,
        edit: false,
      },
    });

    map.addControl(drawControl);

    const handleDrawCreated = (e: any) => {
      console.log('Draw created event fired');
      const layer = e.layer;
      const geoJson = layer.toGeoJSON();
      console.log('GeoJSON created:', geoJson);

      map.eachLayer((layer) => {
        if (layer instanceof L.Polygon && (layer as any)._drawnByUser) {
          map.removeLayer(layer);
        }
      });

      (layer as any)._drawnByUser = true;
      layer.addTo(map);

      console.log('Polygon drawn:', geoJson.geometry);
      console.log('Calling onPolygonDrawn callback:', !!onPolygonDrawn);
      onPolygonDrawn?.(geoJson.geometry);
      console.log('onPolygonDrawn callback called');
    };

    const handleDrawCancel = () => {
      onDrawingCanceled?.();
    };

    map.on((L.Draw as any).Event.CREATED, handleDrawCreated);
    map.on((L.Draw as any).Event.DRAWSTOP, handleDrawCancel);

    return () => {
      map.removeControl(drawControl);
      map.off((L.Draw as any).Event.CREATED, handleDrawCreated);
      map.off((L.Draw as any).Event.DRAWSTOP, handleDrawCancel);
    };
  }, [map, enabled, onPolygonDrawn, onDrawingCanceled]);

  return null;
};

const FitAndRender = ({
  projectArea,
  sectors,
  sensors,
  alerts,
  historicalFires,
  drawingMode,
  onPolygonDrawn,
  onDrawingCanceled,
}: {
  projectArea: ProjectAreaResponse | null;
  sectors: SectorGeo[];
  sensors: SensorGeo[];
  alerts: MapAlerts | null;
  historicalFires: HistoricalFire[];
  drawingMode?: boolean;
  onPolygonDrawn?: (polygon: any) => void;
  onDrawingCanceled?: () => void;
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

  const sensorColor = (sensor: any) => {
    const temperature = sensor.last_temperature;
    const humidity = sensor.last_humidity;
    const smokeLevel = sensor.last_smoke_level;

    if (temperature && temperature > 80) {
      return "#ef4444";
    }
    if (smokeLevel && smokeLevel > 2.0) {
      return "#f59e0b";
    }
    if (humidity && humidity < 20) {
      return "#f59e0b";
    }

    switch (sensor.status) {
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
                radius={8}
                pathOptions={{
                  color: sensorColor(s),
                  fillColor: sensorColor(s),
                  fillOpacity: 0.9,
                  weight: 2,
                }}
              >
                <Popup>
                  <div className="space-y-2">
                    <div className="font-semibold text-lg">{s.name}</div>
                    <div className="text-sm text-gray-600">Type: {s.type} • Sector: {s.sector_name}</div>

                    <div className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                      s.status === 'active' ? 'bg-green-100 text-green-800' :
                      s.status === 'offline' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {s.status}
                    </div>

                    <div className="border-t pt-2 space-y-1">
                      <div className="font-medium text-sm">Latest Readings:</div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>Temperature: <span className={s.last_temperature > 80 ? 'text-red-600 font-bold' : ''}>{s.last_temperature ?? "-"} °C</span></div>
                        <div>Humidity: <span className={s.last_humidity < 20 ? 'text-orange-600 font-bold' : ''}>{s.last_humidity ?? "-"}%</span></div>
                        <div>Smoke: <span className={s.last_smoke_level > 2.0 ? 'text-orange-600 font-bold' : ''}>{s.last_smoke_level ?? "-"}</span></div>
                        <div>Battery: {s.battery_level ?? "-"}%</div>
                      </div>
                    </div>

                    {s.last_reading_at && (
                      <div className="text-xs text-gray-500 border-t pt-1">
                        Last reading: {new Date(s.last_reading_at).toLocaleString()}
                      </div>
                    )}
                    {s.last_seen && (
                      <div className="text-xs text-gray-500">
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

      <DrawingControls
        enabled={drawingMode || false}
        onPolygonDrawn={onPolygonDrawn}
        onDrawingCanceled={onDrawingCanceled}
      />
    </>
  );
};

const RiskMap: FC<RiskMapProps> = ({ className, drawingMode, onPolygonDrawn, onDrawingCanceled }) => {
  console.log('RiskMap props:', { drawingMode, hasOnPolygonDrawn: !!onPolygonDrawn, hasOnDrawingCanceled: !!onDrawingCanceled });

  React.useEffect(() => {
    console.log('drawingMode changed in RiskMap:', drawingMode);
  }, [drawingMode]);
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

    const t = window.setInterval(async () => {
      try {
        const sensorGeo = await apiService.getSensorsGeo();
        const mapAlerts = await apiService.getMapAlerts();
        if (!mounted) return;
        setSensors(sensorGeo || []);
        setAlerts(mapAlerts || null);
      } catch (e) {
      }
    }, 10000);

    const onProjectAreaUpdated = () => {
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
          drawingMode={drawingMode}
          onPolygonDrawn={onPolygonDrawn}
          onDrawingCanceled={onDrawingCanceled}
        />
      </MapContainer>
    </div>
  );
};

export default RiskMap;
