import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';

// Leaflet default icon fix
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

interface LocationPickerMapProps {
  latitude: number;
  longitude: number;
  onLocationSelect: (lat: number, lng: number) => void;
}

const LocationMarker: React.FC<{
  position: [number, number];
  onLocationSelect: (lat: number, lng: number) => void;
}> = ({ position, onLocationSelect }) => {
  const map = useMapEvents({
    click(e) {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });

  useEffect(() => {
    map.flyTo(position, map.getZoom());
  }, [position, map]);

  return <Marker position={position} />;
};

export const LocationPickerMap: React.FC<LocationPickerMapProps> = ({
  latitude,
  longitude,
  onLocationSelect
}) => {
  return (
    <div style={{ height: '220px', width: '100%', borderRadius: '12px', overflow: 'hidden', border: '1px solid #cbd5e1', marginTop: '0.5rem' }}>
      <MapContainer
        center={[latitude, longitude]}
        zoom={15}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocationMarker position={[latitude, longitude]} onLocationSelect={onLocationSelect} />
      </MapContainer>
    </div>
  );
};
