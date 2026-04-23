import { useCallback, useEffect, useState } from "react";

import { Control } from "react-hook-form";
import { toast } from "sonner";

import { EventFormValues } from "@/components/page/event/types";
import { Select } from "@/components/ui/select";
import { SelectOption } from "@/components/ui/select-container";
import { useDebounce } from "@/hooks/use-debounce";
import { getChurches } from "@/service/church";

interface ISelectChurch {
  control: Control<EventFormValues>;
  isSubmitting: boolean;
  value?: string;
}

const SelectChurch = ({ control, isSubmitting, value }: ISelectChurch) => {
  const [search, setSearch] = useState("");
  const [options, setOptions] = useState<SelectOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const debouncedSearch = useDebounce(search, 300);

  const fetchChurches = useCallback(async () => {
    try {
      setIsLoading(true);
      const { data, error } = await getChurches({
        search: debouncedSearch,
        id: Number(value),
      });
      if (error) throw error;
      const options =
        data?.map((church) => ({
          value: church.id.toString(),
          label: church.name,
        })) || [];
      setOptions(options);
    } catch (error) {
      toast.error((error as Error)?.message);
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearch, value]);

  useEffect(() => {
    fetchChurches();
  }, [fetchChurches]);

  return (
    <Select
      label="Church"
      placeholder="Select church"
      name="church_id"
      required
      options={options}
      control={control}
      disabled={isSubmitting || isLoading}
      searchable
      onSearch={setSearch}
    />
  );
};

export default SelectChurch;
