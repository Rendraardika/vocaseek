import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "../../styles/admin/MapComponentMitra.css";

import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;


L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

export default function MapComponent() {
  return (
    <div className="map-wrapper">
      <MapContainer
        center={[-6.2088, 106.8456]}
        zoom={13}
        className="map-container"
      >
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <Marker position={[-6.2088, 106.8456]}>
          <Popup>
            TechNova HQ <br /> Jakarta.
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}