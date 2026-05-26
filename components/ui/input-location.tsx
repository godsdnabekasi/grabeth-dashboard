"use client";

import * as React from "react";

import { Loader2, MapPin, Search, X } from "lucide-react";
import { Control, Controller, FieldValues, Path } from "react-hook-form";

import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";

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
  const containerRef = React.useRef<HTMLDivElement>(null);
  const autocompleteServiceRef =
    React.useRef<google.maps.places.AutocompleteService | null>(null);
  const placesServiceRef =
    React.useRef<google.maps.places.PlacesService | null>(null);
  const geocoderRef = React.useRef<google.maps.Geocoder | null>(null);
  const debounceTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  // Map & Autocomplete UI States
  const [map, setMap] = React.useState<google.maps.Map | null>(null);
  const [inputValue, setInputValue] = React.useState(value?.address || "");
  const [predictions, setPredictions] = React.useState<
    google.maps.places.AutocompletePrediction[]
  >([]);
  const [isOpen, setIsOpen] = React.useState(false);
  const [isLoadingPredictions, setIsLoadingPredictions] = React.useState(false);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = React.useState(-1);

  // Initialize Google Maps API elements
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    libraries: LIBRARIES,
  });

  // Helper to initialize and retrieve Geocoder instance lazily and reuse it
  const getGeocoder = React.useCallback((): google.maps.Geocoder | null => {
    if (!geocoderRef.current && typeof google !== "undefined" && google.maps) {
      geocoderRef.current = new google.maps.Geocoder();
    }
    return geocoderRef.current;
  }, []);

  // Performance Optimization: Only re-compute position when numeric coordinates change,
  // preventing map and marker cascade re-renders when other attributes (e.g. name/address) modify.
  const markerPosition = React.useMemo(
    () => ({
      lat: value?.lat || DEFAULT_CENTER.lat,
      lng: value?.lng || DEFAULT_CENTER.lng,
    }),
    [value?.lat, value?.lng]
  );

  // Synchronize input text with external value changes
  React.useEffect(() => {
    setInputValue(value?.address || "");
  }, [value?.address]);

  // Lazy initialize Autocomplete service
  React.useEffect(() => {
    if (isLoaded) {
      autocompleteServiceRef.current =
        new google.maps.places.AutocompleteService();
    }
  }, [isLoaded]);

  // Lazy initialize Places service
  React.useEffect(() => {
    if (map) {
      placesServiceRef.current = new google.maps.places.PlacesService(map);
    }
  }, [map]);

  // Click Outside Behavior to dismiss recommendations
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Cleanup pending debounce timeouts
  React.useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  // Unified Location State Dispatcher
  const handleLocationUpdate = React.useCallback(
    (lat: number, lng: number, address: string) => {
      onChange({ address, lat, lng, id: value?.id, name: value?.name });
      setInputValue(address);
    },
    [onChange, value?.id, value?.name]
  );

  // Debounced input change callback to search suggestions
  const handleInputChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      setInputValue(val);

      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }

      if (!val.trim()) {
        setPredictions([]);
        setIsOpen(false);
        setActiveSuggestionIndex(-1);
        return;
      }

      setIsOpen(true);
      setIsLoadingPredictions(true);

      debounceTimeoutRef.current = setTimeout(() => {
        if (!autocompleteServiceRef.current) {
          setIsLoadingPredictions(false);
          return;
        }
        autocompleteServiceRef.current.getPlacePredictions(
          { input: val },
          (results, status) => {
            setIsLoadingPredictions(false);
            if (
              status === google.maps.places.PlacesServiceStatus.OK &&
              results
            ) {
              setPredictions(results);
            } else {
              setPredictions([]);
            }
            setActiveSuggestionIndex(-1);
          }
        );
      }, 300);
    },
    []
  );

  // Handle suggestion selection and geocoding details
  const handlePredictionClick = React.useCallback(
    (prediction: google.maps.places.AutocompletePrediction) => {
      setIsOpen(false);
      setInputValue(prediction.description);

      if (placesServiceRef.current) {
        placesServiceRef.current.getDetails(
          {
            placeId: prediction.place_id,
            fields: ["geometry", "formatted_address", "name"],
          },
          (place, status) => {
            if (
              status === google.maps.places.PlacesServiceStatus.OK &&
              place &&
              place.geometry?.location
            ) {
              const lat = place.geometry.location.lat();
              const lng = place.geometry.location.lng();
              const address =
                place.formatted_address || place.name || prediction.description;

              handleLocationUpdate(lat, lng, address);
              map?.panTo({ lat, lng });
              map?.setZoom(15);
            }
          }
        );
      } else {
        const geocoder = getGeocoder();
        if (geocoder) {
          geocoder.geocode(
            { placeId: prediction.place_id },
            (results, status) => {
              if (
                status === "OK" &&
                results?.[0] &&
                results[0].geometry?.location
              ) {
                const location = results[0].geometry.location;
                const lat = location.lat();
                const lng = location.lng();
                const address =
                  results[0].formatted_address || prediction.description;

                handleLocationUpdate(lat, lng, address);
                map?.panTo({ lat, lng });
                map?.setZoom(15);
              }
            }
          );
        }
      }
    },
    [handleLocationUpdate, map, getGeocoder]
  );

  const handleClear = React.useCallback(() => {
    onChange(null);
    setInputValue("");
    setPredictions([]);
    setIsOpen(false);
    setActiveSuggestionIndex(-1);
  }, [onChange]);

  // Keyboard navigation for predictions
  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (!isOpen) {
        if (e.key === "ArrowDown" && predictions.length > 0) {
          setIsOpen(true);
          setActiveSuggestionIndex(0);
        }
        return;
      }

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setActiveSuggestionIndex((prev) =>
            prev < predictions.length - 1 ? prev + 1 : prev
          );
          break;
        case "ArrowUp":
          e.preventDefault();
          setActiveSuggestionIndex((prev) => (prev > 0 ? prev - 1 : -1));
          break;
        case "Enter":
          e.preventDefault();
          if (
            activeSuggestionIndex >= 0 &&
            activeSuggestionIndex < predictions.length
          ) {
            handlePredictionClick(predictions[activeSuggestionIndex]);
          }
          break;
        case "Escape":
          e.preventDefault();
          setIsOpen(false);
          setActiveSuggestionIndex(-1);
          break;
        case "Tab":
          setIsOpen(false);
          break;
      }
    },
    [isOpen, predictions, activeSuggestionIndex, handlePredictionClick]
  );

  // Reverse geocoding for marker drag actions
  const reverseGeocode = React.useCallback(
    (lat: number, lng: number) => {
      const geocoder = getGeocoder();
      if (geocoder) {
        geocoder.geocode({ location: { lat, lng } }, (results, status) => {
          const address =
            status === "OK" && results?.[0]
              ? results[0].formatted_address
              : value?.address || "Selected Location";
          handleLocationUpdate(lat, lng, address);
        });
      }
    },
    [handleLocationUpdate, value?.address, getGeocoder]
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
        <div ref={containerRef} className="relative w-full">
          {isLoaded ? (
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400 group-focus-within:text-primary transition-colors" />
              <input
                ref={inputRef}
                type="text"
                placeholder={placeholder}
                value={inputValue}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                onFocus={() => {
                  if (predictions.length > 0) setIsOpen(true);
                }}
                className={cn(
                  "h-10 flex-row items-center bg-white w-full pl-10 pr-10",
                  "gap-3 rounded-md border border-input shadow-xs transition-[color,box-shadow] outline-none placeholder:text-muted-foreground md:text-sm dark:bg-input/30",
                  "focus-visible:ring-1 focus-visible:ring-ring focus-visible:border-primary",
                  error && "border-red-500 ring-red-500/10",
                  disabled &&
                    "bg-gray-200 pointer-events-none cursor-not-allowed"
                )}
                disabled={disabled}
              />

              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                {isLoadingPredictions && (
                  <Loader2 className="size-4 animate-spin text-gray-400" />
                )}
                {inputValue && !disabled && (
                  <button
                    type="button"
                    onClick={handleClear}
                    className="p-1 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
                  >
                    <X className="size-4 text-gray-400" />
                  </button>
                )}
              </div>

              {isOpen && (predictions.length > 0 || isLoadingPredictions) && (
                <div className="absolute top-full left-0 right-0 z-50 mt-1 max-h-60 overflow-y-auto rounded-md border border-input bg-white dark:bg-zinc-950 p-1 shadow-lg">
                  {isLoadingPredictions && predictions.length === 0 ? (
                    <div className="flex items-center justify-center py-4 px-3 text-xs text-muted-foreground gap-2">
                      <Loader2 className="size-4 animate-spin text-primary" />
                      <span>Searching places...</span>
                    </div>
                  ) : (
                    predictions.map((prediction, idx) => {
                      const isActive = idx === activeSuggestionIndex;
                      return (
                        <button
                          key={prediction.place_id}
                          type="button"
                          onClick={() => handlePredictionClick(prediction)}
                          className={cn(
                            "flex w-full items-start gap-2.5 rounded-sm px-3 py-2 text-left text-sm transition-colors outline-none",
                            isActive
                              ? "bg-slate-100 text-slate-900 dark:bg-zinc-800 dark:text-zinc-50"
                              : "hover:bg-slate-50 dark:hover:bg-zinc-900 text-slate-700 dark:text-zinc-300"
                          )}
                        >
                          <MapPin
                            className={cn(
                              "size-4 shrink-0 mt-0.5",
                              isActive
                                ? "text-primary animate-pulse"
                                : "text-gray-400"
                            )}
                          />
                          <div className="flex flex-col min-w-0">
                            <span className="font-medium truncate text-slate-950 dark:text-zinc-50">
                              {prediction.structured_formatting.main_text}
                            </span>
                            <span className="text-xs text-muted-foreground truncate">
                              {prediction.structured_formatting.secondary_text}
                            </span>
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>
              )}
            </div>
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
