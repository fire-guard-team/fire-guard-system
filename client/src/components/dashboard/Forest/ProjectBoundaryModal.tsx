"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { MapContainer, TileLayer, LayerGroup, GeoJSON, useMap } from "react-leaflet";
import type { LatLngExpression } from "leaflet";
import L from "leaflet";
import "leaflet-draw";
import { apiService } from "../../../utils/api";

const center: LatLngExpression = [35.25, 36.15];

function normalizeGeometry(input: any): any | null {
  if (!input) return null;
  if (typeof input === "string") {
    try {
      return normalizeGeometry(JSON.parse(input));
    } catch {
      return null;
    }
  }
  if (input.type === "Feature") return normalizeGeometry(input.geometry);
  if (input.type === "Polygon") return input;
  return null;
}

function toFeatureCollection(geom: any, name?: string): any {
  return {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        properties: name ? { name } : {},
        geometry: geom,
      },
    ],
  };
}

const WmsNdviOverlay = () => {
  const map = useMap();
  useEffect(() => {
    const layer = L.tileLayer.wms("https://services.terrascope.be/wms/v2", {
      layers: "CGS_S2_NDVI",
      format: "image/png",
      transparent: true,
      opacity: 0.45,
      version: "1.1.1",
      attribution: "Copernicus/ESA (Terrascope) NDVI",
    });
    layer.addTo(map);
    return () => {
      map.removeLayer(layer);
    };
  }, [map]);

  return null;
};

export default function ProjectBoundaryModal({
  open,
  onClose,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  onSaved?: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string>("");
  const [projectArea, setProjectArea] = useState<any>(null);
  const [rawGeoJsonText, setRawGeoJsonText] = useState<string>("");
  const [geoJsonTouched, setGeoJsonTouched] = useState(false);

  const mapRef = useRef<L.Map | null>(null);
  const drawnRef = useRef<L.FeatureGroup | null>(null);
  const drawControlRef = useRef<L.Control.Draw | null>(null);

  const existingGeom = useMemo(() => normalizeGeometry(projectArea?.boundary), [projectArea]);
  const existingFC = useMemo(() => {
    if (!existingGeom) return null;
    return toFeatureCollection(existingGeom, projectArea?.name);
  }, [existingGeom, projectArea]);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    setError("");
    (async () => {
      try {
        const area = await apiService.getCurrentProjectArea();
        setProjectArea(area);
        setRawGeoJsonText(JSON.stringify(area?.boundary ?? null, null, 2));
        setGeoJsonTouched(false);
      } catch (e) {
        console.error(e);
        setError(e instanceof Error ? e.message : "Failed to load project area");
      } finally {
        setLoading(false);
      }
    })();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    if (!mapRef.current) return;

    const map = mapRef.current;

    const drawn = new L.FeatureGroup();
    drawn.addTo(map);
    drawnRef.current = drawn;

    if (existingGeom) {
      const layer = L.geoJSON(existingGeom as any, {
        style: { color: "#3b82f6", weight: 3, fillOpacity: 0.05 },
      });
      layer.eachLayer((l) => drawn.addLayer(l));
    }

    const ctrl = new L.Control.Draw({
      draw: {
        polygon: {
          allowIntersection: false,
          showArea: true,
          shapeOptions: { color: "#3b82f6", weight: 3, fillOpacity: 0.05 },
        },
        polyline: false,
        rectangle: false,
        circle: false,
        circlemarker: false,
        marker: false,
      },
      edit: {
        featureGroup: drawn,
        remove: true,
      },
    });
    drawControlRef.current = ctrl;
    map.addControl(ctrl);

    const onCreated = (e: any) => {
      drawn.clearLayers();
      drawn.addLayer(e.layer);
    };

    map.on(L.Draw.Event.CREATED, onCreated);

    return () => {
      map.off(L.Draw.Event.CREATED, onCreated);
      if (drawControlRef.current) map.removeControl(drawControlRef.current);
      drawControlRef.current = null;
      if (drawnRef.current) {
        map.removeLayer(drawnRef.current);
        drawnRef.current = null;
      }
    };
  }, [open, existingGeom]);

  const save = async () => {
    setSaving(true);
    setError("");
    try {
      let geom: any = null;

      if (drawnRef.current && (drawnRef.current as any).getLayers?.().length) {
        const fc = drawnRef.current.toGeoJSON() as any;
        const asAny: any = fc;
        const first = asAny?.features?.[0];
        geom = normalizeGeometry(first);
      }

      if (geoJsonTouched && rawGeoJsonText.trim()) {
        try {
          const parsed = JSON.parse(rawGeoJsonText);
          const fromText = normalizeGeometry(parsed);
          if (fromText) geom = fromText;
        } catch {
        }
      }

      if (!geom) {
        throw new Error("Please draw a polygon boundary (or paste valid GeoJSON Polygon).");
      }

      await apiService.updateCurrentProjectAreaBoundary(geom);
      window.dispatchEvent(new Event("project-area-updated"));
      onSaved?.();
      onClose();
    } catch (e) {
      console.error(e);
      const msg = e instanceof Error ? e.message : "Failed to save boundary";
      if (msg.includes("Unauthenticated")) {
        setError("Unauthenticated. Please login again to save the boundary.");
      } else {
        setError(msg);
      }
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      <div className="relative bg-white w-[min(1100px,95vw)] max-h-[90vh] rounded-xl shadow-lg overflow-hidden z-10">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div>
            <div className="text-lg font-semibold">Define Project Boundary (Forests Only)</div>
            <div className="text-xs text-gray-500">
              استخدم NDVI للتتبع بدقة وتجنب البحر والعمران. يمكنك أيضاً لصق GeoJSON Polygon.
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 text-sm rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Close
            </button>
            <button
              type="button"
              onClick={save}
              disabled={saving || loading}
              className="px-4 py-2 text-sm rounded-lg bg-green-600 text-white font-semibold disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Boundary"}
            </button>
          </div>
        </div>

        {error && (
          <div className="px-5 py-3 bg-red-50 border-b border-red-200">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-0">
          <div className="h-[70vh]">
            <MapContainer
              center={center}
              zoom={10}
              style={{ height: "100%", width: "100%" }}
              whenReady={(e) => {
                mapRef.current = e.target;
                const bbox = projectArea?.bbox;
                if (bbox) {
                  e.target.fitBounds(
                    [
                      [bbox.min_lat, bbox.min_lng],
                      [bbox.max_lat, bbox.max_lng],
                    ],
                    { padding: [24, 24] }
                  );
                }
              }}
            >
              <LayerGroup>
                <TileLayer
                  url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                  attribution="Tiles © Esri"
                  maxZoom={19}
                />
                <TileLayer
                  url="https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Transportation/MapServer/tile/{z}/{y}/{x}"
                  attribution="Roads © Esri"
                  maxZoom={19}
                  opacity={0.9}
                />
                <TileLayer
                  url="https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"
                  attribution="Labels © Esri"
                  maxZoom={19}
                  opacity={1}
                />
              </LayerGroup>

              {/* NDVI overlay (vegetation) */}
              <WmsNdviOverlay />

              {existingFC && (
                <GeoJSON
                  data={existingFC as any}
                  style={{ color: "#3b82f6", weight: 3, fillOpacity: 0.05 }}
                />
              )}
            </MapContainer>
          </div>

          <div className="border-l border-border p-4 space-y-3 overflow-auto max-h-[70vh]">
            <div className="text-sm font-semibold">Advanced: Paste GeoJSON Polygon</div>
            <textarea
              value={rawGeoJsonText}
              onChange={(e) => {
                setRawGeoJsonText(e.target.value);
                setGeoJsonTouched(true);
              }}
              rows={18}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs font-mono focus:ring-2 focus:ring-green-400 outline-none"
              placeholder='{"type":"Polygon","coordinates":[...]}'
            />
            <div className="text-xs text-gray-500">
              ملاحظة: يمكنك إنشاء GeoJSON دقيق جداً (مع ثقوب لاستثناء قرى/بحيرات) عبر QGIS ثم لصقه هنا.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

