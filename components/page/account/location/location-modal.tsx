import React, { useCallback, useEffect, useState } from "react";

import { Trash2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { zodResolver } from "@hookform/resolvers/zod";

import {
  AccountLocationFormValues,
  locationSchema,
} from "@/components/page/account/types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import LoadingSection from "@/components/ui/loading-section";
import { Select } from "@/components/ui/select";
import { SelectOption } from "@/components/ui/select-container";
import { Textarea } from "@/components/ui/textarea";
import { LOCATION_OPTIONS } from "@/config/common";
import { getCity, getDistrict, getProvince } from "@/service/location";

interface IProps {
  open: boolean;
  initialValues: AccountLocationFormValues;
  mode: "create" | "edit";
  onOpenChange: (open: boolean) => void;
  onAddLocation: (
    location: AccountLocationFormValues,
    mode: "create" | "edit"
  ) => void;
  onRemoveLocation?: () => void; // FIX 1: Tambah handler remove yang proper
}

const AccountLocationModal = ({
  open,
  initialValues,
  mode,
  onOpenChange,
  onAddLocation,
  onRemoveLocation,
}: IProps) => {
  const [province, setProvince] = useState<SelectOption[]>([]);
  const [city, setCity] = useState<SelectOption[]>([]);
  const [district, setDistrict] = useState<SelectOption[]>([]);

  // FIX 2: Simpan label sebagai objek terstruktur, bukan state terpisah
  const [locationLabels, setLocationLabels] = useState<{
    province?: string;
    city?: string;
    district?: string;
  }>({});

  const [isLoadingProvince, setIsLoadingProvince] = useState(false); // FIX 3: Loading lebih granular
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { control, setValue, watch, handleSubmit, reset } =
    useForm<AccountLocationFormValues>({
      resolver: zodResolver(locationSchema),
      defaultValues: initialValues,
    });

  const provinceValue = watch("province_id");
  const cityValue = watch("city_id");
  const districtValue = watch("district_id");

  const toggleOpen = useCallback(() => {
    onOpenChange(!open);
  }, [onOpenChange, open]);

  const fetchProvince = async () => {
    try {
      setIsLoadingProvince(true);
      const { data, error } = await getProvince();
      if (error) throw error;
      setProvince(
        data?.map((p) => ({ label: p.name, value: String(p.id) })) || []
      );
    } catch (error) {
      toast.error((error as Error)?.message || "Failed to fetch province");
    } finally {
      setIsLoadingProvince(false);
    }
  };

  // FIX 4: Pisahkan fetch city agar bisa dipanggil dari useEffect tanpa recreate tiap render
  const fetchCity = useCallback(
    async (provinceId?: string) => {
      if (!provinceId) return;

      try {
        setValue("city_id", undefined);
        setValue("city", undefined);
        setValue("district_id", undefined);
        setValue("district", undefined);
        setCity([]);
        setDistrict([]);

        const provinceData = province.find((p) => p.value === provinceId);
        setLocationLabels((prev) => ({
          ...prev,
          province: provinceData?.label,
          city: undefined,
          district: undefined,
        }));

        const { data, error } = await getCity(Number(provinceId));
        if (error) throw error;
        setCity(
          data?.map((c) => ({ label: c.name, value: String(c.id) })) || []
        );
      } catch (error) {
        toast.error((error as Error)?.message || "Failed to fetch city");
      }
    },
    [province, setValue]
  );

  // FIX 5: Pisahkan fetch district
  const fetchDistrict = useCallback(
    async (cityId?: string) => {
      if (!cityId) return;

      try {
        setValue("district_id", undefined);
        setValue("district", undefined);
        setDistrict([]);

        const cityData = city.find((c) => c.value === cityId);
        setLocationLabels((prev) => ({
          ...prev,
          city: cityData?.label,
          district: undefined,
        }));

        const { data, error } = await getDistrict(Number(cityId));
        if (error) throw error;
        setDistrict(
          data?.map((d) => ({ label: d.name, value: String(d.id) })) || []
        );
      } catch (error) {
        toast.error((error as Error)?.message || "Failed to fetch district");
      }
    },
    [city, setValue]
  );

  // FIX 6: Ganti useMemo dengan useEffect untuk side effects
  useEffect(() => {
    if (initialValues?.province_id || (provinceValue && province.length > 0)) {
      fetchCity(provinceValue);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [provinceValue]);

  useEffect(() => {
    if (initialValues?.city_id || (cityValue && city.length > 0)) {
      fetchDistrict(cityValue);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cityValue]);

  // FIX 7: Update label district saat districtValue berubah
  useEffect(() => {
    if (initialValues?.district_id || (districtValue && district.length > 0)) {
      const districtData = district.find((d) => d.value === districtValue);
      if (districtData) {
        setLocationLabels((prev) => ({
          ...prev,
          district: districtData.label,
        }));
      }
    }
  }, [districtValue, district, initialValues?.district_id]);

  // FIX 8: Reset form dan state saat modal dibuka ulang dengan initialValues baru
  useEffect(() => {
    if (open) {
      reset(initialValues);
      setLocationLabels({
        province: initialValues?.province,
        city: initialValues?.city,
        district: initialValues?.district,
      });
    }
  }, [open, initialValues, reset]);

  useEffect(() => {
    fetchProvince();
  }, []);

  const onSubmit = async (data: AccountLocationFormValues) => {
    try {
      setIsSubmitting(true);
      onAddLocation(
        {
          ...data,
          province: locationLabels.province,
          city: locationLabels.city,
          district: locationLabels.district,
        },
        mode
      );
      toggleOpen();
    } catch (error) {
      toast.error((error as Error)?.message || "Failed to save location");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemove = () => {
    onRemoveLocation?.();
    toggleOpen();
  };

  // FIX 9: Disabled logic berdasarkan watch() value aktif, bukan initialValues
  const isCityDisabled = !provinceValue;
  const isDistrictDisabled = !cityValue;

  return (
    <Dialog open={open} onOpenChange={toggleOpen}>
      {/* FIX 10: Loading hanya tampil saat fetch province awal, bukan saat semua operasi */}
      {isLoadingProvince ? (
        <LoadingSection />
      ) : (
        <DialogContent className="sm:max-w-xl p-0 w-full">
          <DialogHeader
            title="Location"
            description="Fill in the location details"
          />
          <form className="grid grid-cols-2 gap-6 px-4">
            <Input
              label="Name"
              placeholder="Enter location name"
              name="name"
              control={control}
            />
            <Select
              label="Type"
              placeholder="Select location type"
              name="type"
              options={LOCATION_OPTIONS}
              control={control}
            />
            <Textarea
              label="Address"
              placeholder="Enter address"
              name="address"
              control={control}
              containerClassName="col-span-2"
            />
            <Select
              label="Province"
              name="province_id"
              placeholder="Select province"
              options={province}
              control={control}
            />
            <Select
              label="City"
              name="city_id"
              options={city}
              placeholder="Select city"
              control={control}
              disabled={isCityDisabled} // FIX 9
            />
            <Select
              label="District"
              name="district_id"
              options={district}
              placeholder="Select district"
              control={control}
              disabled={isDistrictDisabled} // FIX 9
            />
            <Input
              label="Postal Code"
              name="postal_code"
              placeholder="Enter postal code"
              control={control}
            />
          </form>

          <DialogFooter className="justify-end">
            {/* FIX 1 & 10: Tombol Remove hanya tampil di mode edit, dengan handler yang benar */}
            {mode === "edit" && onRemoveLocation && (
              <Button
                type="button"
                variant="destructive"
                onClick={handleRemove}
              >
                <Trash2 className="size-4" />
                Remove Location
              </Button>
            )}
            <Button
              type="button"
              onClick={handleSubmit(onSubmit)}
              disabled={isSubmitting}
            >
              {isSubmitting
                ? "Saving..."
                : mode === "create"
                  ? "Add Location"
                  : "Update Location"}
            </Button>
          </DialogFooter>
        </DialogContent>
      )}
    </Dialog>
  );
};

export default AccountLocationModal;
