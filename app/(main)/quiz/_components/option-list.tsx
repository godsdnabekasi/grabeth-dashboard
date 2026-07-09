import { GripVertical, Trash2 } from "lucide-react";
import { Control, UseFieldArrayRemove } from "react-hook-form";

import { useSortable } from "@dnd-kit/react/sortable";

import { QuestionFormValues } from "../_types/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface OptionListProps {
  id: string;
  index: number;
  control: Control<QuestionFormValues>;
  showRemove: boolean;
  remove: UseFieldArrayRemove;
}

const OptionList = ({
  id,
  index,
  control,
  showRemove,
  remove,
}: OptionListProps) => {
  const { ref } = useSortable({
    id,
    index,
  });

  return (
    <span ref={ref} className="flex w-full gap-2 items-center">
      <GripVertical className="size-4 text-gray-500 cursor-grab" />
      <Input
        placeholder={`Option ${index + 1}`}
        name={`detail.options.${index}.label`}
        control={control}
        containerClassName="flex-1"
      />
      <Input
        placeholder={`Value ${index + 1}`}
        name={`detail.options.${index}.value`}
        control={control}
        containerClassName="hidden"
      />
      {showRemove && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="text-destructive"
          onClick={() => remove(index)}
        >
          <Trash2 className="size-4" />
        </Button>
      )}
    </span>
  );
};

export default OptionList;
