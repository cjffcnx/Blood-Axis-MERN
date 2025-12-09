import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Box, Typography, CircularProgress, Alert } from '@mui/material';
import axios from 'axios';

// Fix for default marker icons in React-Leaflet
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Component to recenter map when coords change
const RecenterAutomatically = ({ lat, lng }) => {
    const map = useMap();
    useEffect(() => {
        map.setView([lat, lng]);
    }, [lat, lng, map]);
    return null;
};

const NearbyMap = ({ userLat, userLng }) => {
    const [hospitals, setHospitals] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchNearbyPlaces = async () => {
            if (!userLat || !userLng) return;
            setLoading(true);
            try {
                // Overpass API Query for hospitals and blood banks around 5km radius
                const query = `
                    [out:json];
                    (
                      node["amenity"="hospital"](around:5000,${userLat},${userLng});
                      node["healthcare"="blood_bank"](around:5000,${userLat},${userLng});
                      way["amenity"="hospital"](around:5000,${userLat},${userLng});
                    );
                    out center;
                `;
                const response = await axios.get(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`);
                setHospitals(response.data.elements);
            } catch (err) {
                console.error("Overpass API Error:", err);
                setError("Failed to fetch nearby places.");
            } finally {
                setLoading(false);
            }
        };

        fetchNearbyPlaces();
    }, [userLat, userLng]);

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}><CircularProgress /></Box>;
    if (error) return <Alert severity="error">{error}</Alert>;

    return (
        <Box sx={{ height: '400px', width: '100%', borderRadius: 2, overflow: 'hidden', border: '1px solid #ddd' }}>
            <MapContainer center={[userLat, userLng]} zoom={14} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {/* User Location */}
                <Marker position={[userLat, userLng]}>
                    <Popup>
                        <b>You are here</b>
                    </Popup>
                </Marker>

                {/* Nearby Places */}
                {hospitals.map((place) => {
                    const lat = place.lat || place.center.lat;
                    const lon = place.lon || place.center.lon;
                    if (!lat || !lon) return null;

                    return (
                        <Marker key={place.id} position={[lat, lon]}>
                            <Popup>
                                <b>{place.tags.name || "Unnamed Facility"}</b> <br />
                                {place.tags.amenity === "hospital" ? "🏥 Hospital" : "🩸 Blood Bank"}
                            </Popup>
                        </Marker>
                    );
                })}

                <RecenterAutomatically lat={userLat} lng={userLng} />
            </MapContainer>
        </Box>
    );
};

export default NearbyMap;
