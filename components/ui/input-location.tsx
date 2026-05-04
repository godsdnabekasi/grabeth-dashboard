"use client";

import * as React from "react";

import { MapPin, Search, X } from "lucide-react";
import { Control, Controller, FieldValues, Path } from "react-hook-form";

import {
  Autocomplete,
  GoogleMap,
  Marker,
  useJsApiLoader,
} from "@react-google-maps/api";

import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

// Stable constants to prevent unnecessary re-renders
const LIBRARIES: ("places" | "geometry")[] = ["places", "geometry"];
const DEFAULT_CENTER = { lat: -6.2088, lng: 106.8456 }; // Jakarta default
const MAP_OPTIONS: google.maps.MapOptions = {
  disableDefaultUI: false,
  mapTypeControl: false,
  streetViewControl: false,
  fullscreenControl: false,
  zoomControl: true,
};

export interface LocationValue {
  id?: number;
  name?: string;
  address: string;
  lat: number;
  lng: number;
}

interface InputLocationContainerProps {
  label?: string;
  error?: string;
  value?: LocationValue | null;
  onChange: (value: LocationValue | null) => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
  containerClassName?: string;
  required?: boolean;
  name?: string;
}

function InputLocationContainer({
  label,
  error,
  value,
  onChange,
  disabled,
  placeholder = "Search location...",
  className,
  containerClassName,
  required,
  name,
}: InputLocationContainerProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [map, setMap] = React.useState<google.maps.Map | null>(null);
  const [autocomplete, setAutocomplete] =
    React.useState<google.maps.places.Autocomplete | null>(null);

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    libraries: LIBRARIES,
  });

  const markerPosition = React.useMemo(
    () => ({
      lat: value?.lat || DEFAULT_CENTER.lat,
      lng: value?.lng || DEFAULT_CENTER.lng,
    }),
    [value]
  );

  // Synchronize input text with external value changes
  React.useEffect(() => {
    if (inputRef.current) {
      const currentAddress = value?.address || "";
      if (inputRef.current.value !== currentAddress) {
        inputRef.current.value = currentAddress;
      }
    }
  }, [value?.address]);

  // Handle location updates in a unified way
  const handleLocationUpdate = React.useCallback(
    (lat: number, lng: number, address: string) => {
      onChange({ address, lat, lng, id: value?.id, name: value?.name });
      if (inputRef.current) {
        inputRef.current.value = address;
      }
    },
    [onChange, value?.id, value?.name]
  );

  const onAutocompleteLoad = React.useCallback(
    (instance: google.maps.places.Autocomplete) => {
      setAutocomplete(instance);
    },
    []
  );

  const onPlaceChanged = React.useCallback(() => {
    if (!autocomplete) return;
    const place = autocomplete.getPlace();

    if (place.geometry?.location) {
      const lat = place.geometry.location.lat();
      const lng = place.geometry.location.lng();
      const address = place.formatted_address || place.name || "";

      handleLocationUpdate(lat, lng, address);
      map?.panTo({ lat, lng });
      map?.setZoom(15);
    }
  }, [autocomplete, handleLocationUpdate, map]);

  const reverseGeocode = React.useCallback(
    (lat: number, lng: number) => {
      const geocoder = new google.maps.Geocoder();
      geocoder.geocode({ location: { lat, lng } }, (results, status) => {
        const address =
          status === "OK" && results?.[0]
            ? results[0].formatted_address
            : value?.address || "Selected Location";
        handleLocationUpdate(lat, lng, address);
      });
    },
    [handleLocationUpdate, value?.address]
  );

  const onMarkerDragEnd = React.useCallback(
    (e: google.maps.MapMouseEvent) => {
      if (e.latLng) {
        reverseGeocode(e.latLng.lat(), e.latLng.lng());
      }
    },
    [reverseGeocode]
  );

  const onMapClick = React.useCallback(
    (e: google.maps.MapMouseEvent) => {
      if (disabled || !e.latLng) return;
      reverseGeocode(e.latLng.lat(), e.latLng.lng());
    },
    [disabled, reverseGeocode]
  );

  if (loadError) {
    return (
      <div className="p-4 border border-red-200 bg-red-50 text-red-600 rounded-md">
        Error loading Google Maps. Please check your API key.
      </div>
    );
  }

  return (
    <div className={cn("space-y-2", containerClassName)}>
      {label && (
        <Label htmlFor={name} required={required}>
          {label}
        </Label>
      )}

      <div className={cn("relative flex flex-col gap-3", className)}>
        <div className="relative">
          {isLoaded ? (
            <Autocomplete
              onLoad={onAutocompleteLoad}
              onPlaceChanged={onPlaceChanged}
            >
              <div className="relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400 group-focus-within:text-primary transition-colors" />
                <input
                  ref={inputRef}
                  type="text"
                  placeholder={placeholder}
                  className={cn(
                    "h-10 flex-row items-center bg-white w-full px-10",
                    "gap-3 rounded-md border border-input shadow-xs transition-[color,box-shadow] outline-none placeholder:text-muted-foreground md:text-sm dark:bg-input/30",
                    error && "border-red-500 ring-red-500/10",
                    disabled &&
                      "bg-gray-200 pointer-events-none cursor-not-allowed"
                  )}
                  disabled={disabled}
                  defaultValue={value?.address}
                />
                {value && !disabled && (
                  <button
                    type="button"
                    onClick={() => onChange(null)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <X className="size-4 text-gray-400" />
                  </button>
                )}
              </div>
            </Autocomplete>
          ) : (
            <Skeleton className="h-10 w-full rounded-lg" />
          )}
        </div>

        <div className="relative h-[300px] w-full rounded-xl overflow-hidden border border-input shadow-sm">
          {isLoaded ? (
            <GoogleMap
              mapContainerStyle={{ width: "100%", height: "100%" }}
              center={markerPosition || DEFAULT_CENTER}
              zoom={markerPosition ? 15 : 12}
              onLoad={setMap}
              onClick={onMapClick}
              options={MAP_OPTIONS}
              clickableIcons={false}
            >
              {markerPosition && (
                <Marker
                  position={markerPosition}
                  draggable={!disabled}
                  onDragEnd={onMarkerDragEnd}
                  animation={google.maps.Animation.DROP}
                />
              )}
            </GoogleMap>
          ) : (
            <div className="w-full h-full bg-gray-50 flex flex-col items-center justify-center gap-2">
              <Skeleton className="w-full h-full absolute inset-0" />
              <div className="relative z-10 flex flex-col items-center text-gray-400">
                <MapPin className="size-8 animate-bounce" />
                <span className="text-sm font-medium">Loading Map...</span>
              </div>
            </div>
          )}
        </div>

        {value && (
          <div className="flex items-center gap-4 text-[10px] text-gray-400 font-mono">
            <span>Lat: {markerPosition.lat.toFixed(6)}</span>
            <span>Lng: {markerPosition.lng.toFixed(6)}</span>
          </div>
        )}
      </div>

      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}

interface FormInputLocationProps<T extends FieldValues> {
  name: Path<T>;
  control: Control<T>;
  label?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  containerClassName?: string;
}

function InputLocation<T extends FieldValues>({
  name,
  control,
  ...props
}: FormInputLocationProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, value }, fieldState: { error } }) => (
        <InputLocationContainer
          {...props}
          name={name}
          value={value}
          onChange={onChange}
          error={error?.message}
        />
      )}
    />
  );
}

export { InputLocation, InputLocationContainer };
