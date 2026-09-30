import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

type Props = {
  center: [number, number];
  zoom?: number;
  className?: string;
  // Draggable pin (checkout)
  pin?: [number, number] | null;
  onPinChange?: (lat: number, lng: number) => void;
  // Fixed markers (tracking)
  dest?: [number, number] | null;
  rider?: [number, number] | null;
};

const dot = (color: string) =>
  L.divIcon({
    className: "",
    html: `<div style="width:18px;height:18px;border-radius:50%;background:${color};border:3px solid #fff;box-shadow:0 0 0 2px ${color}66"></div>`,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
  });

export default function MapView({ center, zoom = 15, className, pin, onPinChange, dest, rider }: Props) {
  const el = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const pinMarker = useRef<L.Marker | null>(null);
  const destMarker = useRef<L.Marker | null>(null);
  const riderMarker = useRef<L.Marker | null>(null);
  const onChange = useRef(onPinChange);
  useEffect(() => {
    onChange.current = onPinChange;
  }, [onPinChange]);

  useEffect(() => {
    if (!el.current) return;
    const m = L.map(el.current).setView(center, zoom);
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
      maxZoom: 19,
    }).addTo(m);
    if (onPinChange) {
      m.on("click", (e: L.LeafletMouseEvent) => onChange.current?.(e.latlng.lat, e.latlng.lng));
    }
    map.current = m;
    return () => {
      m.remove();
      map.current = null;
      pinMarker.current = destMarker.current = riderMarker.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const m = map.current;
    if (!m) return;
    if (pin) {
      if (!pinMarker.current) {
        const mk = L.marker(pin, { draggable: true }).addTo(m);
        mk.on("dragend", () => {
          const p = mk.getLatLng();
          onChange.current?.(p.lat, p.lng);
        });
        pinMarker.current = mk;
      } else pinMarker.current.setLatLng(pin);
      m.panTo(pin);
    }
  }, [pin]);

  useEffect(() => {
    const m = map.current;
    if (!m) return;
    if (dest) {
      if (!destMarker.current) destMarker.current = L.marker(dest, { icon: dot("#16a34a") }).addTo(m);
      else destMarker.current.setLatLng(dest);
    }
    if (rider) {
      if (!riderMarker.current) riderMarker.current = L.marker(rider, { icon: dot("#dc2626") }).addTo(m);
      else riderMarker.current.setLatLng(rider);
      m.panTo(rider);
    } else if (riderMarker.current) {
      riderMarker.current.remove();
      riderMarker.current = null;
    }
  }, [dest, rider]);

  return <div ref={el} className={className ?? "h-64 w-full rounded-lg"} />;
}
