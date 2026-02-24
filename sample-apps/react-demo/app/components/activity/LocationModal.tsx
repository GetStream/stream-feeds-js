import { useCallback, useRef, forwardRef, useImperativeHandle, useState } from 'react';
import { getCityFromCoords, getCoordsFromCity } from '../../utility/geocoding';

export type LocationData = {
  city: string;
  lat: number;
  lng: number;
};

export type LocationModalHandle = {
  open: () => void;
  close: () => void;
};

type LocationModalProps = {
  onConfirm: (location: LocationData) => void;
};

export const LocationModal = forwardRef<LocationModalHandle, LocationModalProps>(
  ({ onConfirm }, ref) => {
    const dialogRef = useRef<HTMLDialogElement>(null);
    const [isLocating, setIsLocating] = useState(false);
    const [detectedCity, setDetectedCity] = useState<string | null>(null);
    const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
    const [error, setError] = useState<string | null>(null);

    const open = useCallback(() => {
      setDetectedCity(null);
      setCoords(null);
      setError(null);
      setIsLocating(false);
      dialogRef.current?.showModal();
    }, []);

    const close = useCallback(() => {
      dialogRef.current?.close();
    }, []);

    useImperativeHandle(ref, () => ({ open, close }));

    const handleUseLocation = useCallback(async () => {
      setIsLocating(true);
      setError(null);
      setDetectedCity(null);
      setCoords(null);

      try {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: false,
            timeout: 10000,
          });
        });

        const { latitude, longitude } = position.coords;
        const city = await getCityFromCoords(latitude, longitude);

        if (!city) {
          setError('Could not determine your city from your location. Please try again.');
          setIsLocating(false);
          return;
        }

        const cityCoords = await getCoordsFromCity(city);
        if (!cityCoords) {
          setError('Could not resolve city coordinates. Please try again.');
          setIsLocating(false);
          return;
        }

        setDetectedCity(city);
        setCoords({ lat: cityCoords.lat, lng: cityCoords.lon });
      } catch {
        setError('Location access was denied or unavailable. Please enable location in your browser settings.');
      } finally {
        setIsLocating(false);
      }
    }, []);

    const handleConfirm = useCallback(() => {
      if (detectedCity && coords) {
        onConfirm({ city: detectedCity, ...coords });
        close();
      }
    }, [detectedCity, coords, onConfirm, close]);

    const handleCancel = useCallback(() => {
      close();
    }, [close]);

    return (
      <dialog ref={dialogRef} className="modal" onClose={() => setError(null)}>
        <div className="modal-box w-full max-w-md">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-xl text-primary">location_on</span>
              <h3 className="font-semibold text-lg">Add Location</h3>
            </div>
            <button
              type="button"
              className="btn btn-sm btn-circle btn-ghost"
              onClick={handleCancel}
              aria-label="Close"
            >
              <span className="material-symbols-outlined text-xl">close</span>
            </button>
          </div>

          <div className="bg-info/10 border border-info/20 rounded-xl p-4 mb-6">
            <div className="flex gap-3">
              <span className="material-symbols-outlined text-info text-xl shrink-0 mt-0.5">info</span>
              <div className="text-sm text-base-content/80">
                <p className="font-medium text-base-content mb-1">Privacy notice</p>
                <p>Your exact location will not be saved. Only your city name and its public coordinates will be attached to your post.</p>
              </div>
            </div>
          </div>

          {!detectedCity && !isLocating && (
            <button
              type="button"
              className="btn btn-outline btn-primary w-full gap-2"
              onClick={handleUseLocation}
            >
              <span className="material-symbols-outlined text-xl">my_location</span>
              Use my current location
            </button>
          )}

          {isLocating && (
            <div className="flex flex-col items-center gap-3 py-4">
              <span className="loading loading-spinner loading-md text-primary" />
              <span className="text-sm text-base-content/60">Detecting your location...</span>
            </div>
          )}

          {detectedCity && coords && (
            <div className="flex items-center gap-3 p-4 rounded-xl border-2 border-primary bg-primary/5">
              <span className="material-symbols-outlined text-primary text-2xl">location_city</span>
              <div className="flex-1">
                <div className="font-semibold text-base">{detectedCity}</div>
              </div>
            </div>
          )}

          {error && (
            <div className="mt-4 p-3 rounded-lg bg-error/10 border border-error/20 text-sm text-error flex items-start gap-2">
              <span className="material-symbols-outlined text-error text-lg shrink-0 mt-0.5">warning</span>
              <span>{error}</span>
            </div>
          )}

          <div className="modal-action">
            <button type="button" className="btn btn-ghost" onClick={handleCancel}>
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleConfirm}
              disabled={!detectedCity || !coords}
            >
              Attach Location
            </button>
          </div>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button type="button" onClick={handleCancel}>close</button>
        </form>
      </dialog>
    );
  }
);

LocationModal.displayName = 'LocationModal';
