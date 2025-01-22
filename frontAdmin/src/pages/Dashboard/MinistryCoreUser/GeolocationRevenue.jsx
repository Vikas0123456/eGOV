import React from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Tooltip,
} from "react-leaflet";
import L from "leaflet"; // Import Leaflet library
import "leaflet/dist/leaflet.css";
import locationPng from "../../../assets/images/location.png"
const customIcon = new L.Icon({
  iconUrl: locationPng ,
  iconSize: [30, 30],
  iconAnchor: [15, 30],
  popupAnchor: [0, -30],
});

const locations = [
  { name: "West End",revenue: "210",coordinates: [26.688, -78.979], percentage: 75 },
  { name: "Freeport", revenue:"310",coordinates: [26.532, -78.696], percentage: 47 },
  { name: "Nassau", revenue:"556",coordinates: [25.034, -77.396], percentage: 82 },
];

const GeolocationRevenue = () => {
  const center = [25.034, -77.396]; 

  return (
    <MapContainer
      center={center}
      zoom={8}
      style={{ width: "100%", height: "335px",zIndex:0 }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />

      {locations.map((location, index) => (
        <Marker
          key={index}
          position={location.coordinates}
          icon={customIcon} // Set the custom icon
        >
          <Popup>
            <div className="px-2 py-2 mt-1">
              <p className="mb-1">
                {location.name}
                <span className="float-end">{location.percentage}%</span>
              </p>
              <div className="progress mt-1" style={{ height: "6px" }}>
                <div
                  className="progress-bar progress-bar-striped bg-primary"
                  role="progressbar"
                  style={{ width: `${location.percentage}%` }}
                  aria-valuenow={location.percentage}
                  aria-valuemin="0"
                  aria-valuemax="100"
                ></div>
              </div>
            </div>
          </Popup>
          <Tooltip >{location.name}{" $"}{location.revenue}</Tooltip>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default GeolocationRevenue;
