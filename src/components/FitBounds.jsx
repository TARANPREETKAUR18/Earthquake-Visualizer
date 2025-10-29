import { useEffect } from 'react';
import { useMap } from 'react-leaflet';

export default function FitBounds({ features }) {
  const map = useMap();

  useEffect(() => {
    if (features.length > 0) {
      const bounds = features.reduce((bounds, feature) => {
        const [lng, lat] = feature.geometry.coordinates;
        const point = [lat, lng];
        return bounds.extend(point);
      }, map.getBounds());

      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [features, map]);

  return null;
}