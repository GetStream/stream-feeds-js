const PHOTON_BASE = 'https://photon.komoot.io';

type PhotonReverseFeature = {
  properties?: {
    city?: string;
    town?: string;
    village?: string;
    name?: string;
    locality?: string;
    county?: string;
  };
};

type PhotonSearchFeature = {
  geometry?: { coordinates?: [number, number] };
};

/**
 * Reverse geocoding: convert latitude/longitude to a city name.
 * Uses Photon (OpenStreetMap). No API key required.
 */
export async function getCityFromCoords(
  lat: number,
  lon: number,
): Promise<string | null> {
  const url = `${PHOTON_BASE}/reverse?lat=${lat}&lon=${lon}`;
  const res = await fetch(url);
  if (!res.ok) return null;

  const data = (await res.json()) as { features?: PhotonReverseFeature[] };
  const props = data?.features?.[0]?.properties;
  if (!props) return null;

  return (
    props.city ??
    props.town ??
    props.village ??
    props.locality ??
    props.name ??
    props.county ??
    null
  );
}

export type Coords = { lat: number; lon: number };

/**
 * Forward geocoding: convert a city name (or address) to latitude/longitude.
 * Uses Photon (OpenStreetMap). No API key required.
 */
export async function getCoordsFromCity(city: string): Promise<Coords | null> {
  const url = `${PHOTON_BASE}/api/?q=${encodeURIComponent(city)}&limit=1`;
  const res = await fetch(url);
  if (!res.ok) return null;

  const data = (await res.json()) as { features?: PhotonSearchFeature[] };
  const coords = data?.features?.[0]?.geometry?.coordinates; // [lon, lat]
  if (!coords || coords.length < 2) return null;

  return { lon: coords[0], lat: coords[1] };
}
