import React, { useEffect, useState, useMemo } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import FitBounds from './components/FitBounds';

export default function App() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [minMag, setMinMag] = useState(0);
  const [earthquakeData, setEarthquakeData] = useState([]);

  const filtered = useMemo(() => {
    return earthquakeData.filter(f => f.properties.mag >= minMag);
  }, [earthquakeData, minMag]);

  useEffect(() => {
    fetch('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson')
      .then(res => res.json())
      .then(data => {
        setEarthquakeData(data.features);
        setLoading(false);
      })
      .catch(err => {
        setError('Failed to load earthquake data');
        setLoading(false);
      });
  }, []);

  const getRadius = (magnitude) => Math.max(6, magnitude * 3);
  const getColor = (depth) => {
    if (depth < 10) return '#00ff00';
    if (depth < 50) return '#ffff00';
    if (depth < 100) return '#ff9900';
    return '#ff0000';
  };

  return (
    <div className="h-screen flex flex-col">
      <header className="bg-gray-800 text-white p-4">
        <label className="text-sm flex items-center gap-2">
          Min Magnitude: <span className="font-bold">{minMag}</span>
          <input
            type="range"
            min="0"
            max="7"
            step="0.1"
            value={minMag}
            onChange={(e) => setMinMag(parseFloat(e.target.value))}
            className="w-40 accent-green-500"
          />
        </label>
      </header>

      <main className="flex-1 relative">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            Loading data…
          </div>
        )}
        {error && (
          <div className="absolute top-3 left-3 bg-red-100 text-red-800 px-3 py-2 rounded shadow">
            {error}
          </div>
        )}

        <MapContainer center={[20, 0]} zoom={2} scrollWheelZoom style={{ height: '100%' }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <FitBounds features={filtered} />

          {filtered.map((f) => {
            const [lng, lat, depth] = f.geometry.coordinates;
            const { mag, place, time } = f.properties;
            return (
              <CircleMarker
                key={f.id}
                center={[lat, lng]}
                radius={getRadius(mag)}
                pathOptions={{
                  color: getColor(depth),
                  fillColor: getColor(depth),
                  fillOpacity: 0.7
                }}
              >
                <Popup>
                  <div className="text-sm">
                    <h3 className="font-bold">M {mag} — {place}</h3>
                    <p>Depth: {depth} km</p>
                    <p>Time: {new Date(time).toUTCString()}</p>
                    <a
                      href={`https://earthquake.usgs.gov/earthquakes/eventpage/${f.id}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-500 underline"
                    >
                      View Details
                    </a>
                  </div>
                </Popup>
              </CircleMarker>
            );
          })}
        </MapContainer>
      </main>

      <footer className="bg-gray-800 text-gray-400 text-xs py-2 px-4 flex justify-between">
        <p>Data: USGS Earthquake API (24h feed)</p>
        <p>Candidate ID: Naukri1025</p>
      </footer>
    </div>
  );
}