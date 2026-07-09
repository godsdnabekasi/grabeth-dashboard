import { useCallback, useState } from "react";

import { Checkbox } from "@/components/ui/checkbox";
import {
  Field,
  FieldContent,
  FieldLabel,
  FieldTitle,
} from "@/components/ui/field";
import { InputContainer } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { TQuestionType } from "@/types/question";

type AnswerOption = {
  id?: string;
  label: string;
  value?: string;
};

interface AnswerListProps {
  initialValues?: string | null;
  type: TQuestionType;
  options: AnswerOption[];
  onChange: (value: string) => void;
}

const AnswerList = ({
  initialValues,
  type,
  options,
  onChange,
}: AnswerListProps) => {
  const [defaultValue, setDefaultValue] = useState(initialValues ?? "");
  const [selectedValues, setSelectedValues] = useState<string[]>([]);

  const onCheckboxChange = useCallback(
    (val: string, checked: boolean) => {
      const updatedSelected = checked
        ? [...selectedValues, val]
        : selectedValues.filter((v) => v !== val);
      setSelectedValues(updatedSelected);
      if (type === "multiple_select") {
        onChange(updatedSelected.join(","));
      }
    },
    [onChange, selectedValues, type]
  );

  const onChangeText = useCallback(
    (val: string) => {
      setDefaultValue(val);
      onChange(val);
    },
    [onChange]
  );

  return (
    <div className="flex flex-col w-full gap-2 animate-in fade-in duration-300">
      {type === "select" ? (
        <RadioGroup defaultValue={defaultValue} onValueChange={onChange}>
          {options.map((option, i) => (
            <FieldLabel
              key={option.id ?? `${option.label}-idx-${i}`}
              className="cursor-pointer hover:bg-gray-50"
            >
              <Field orientation="horizontal">
                <FieldContent>
                  <FieldTitle>{option.label}</FieldTitle>
                </FieldContent>
                <RadioGroupItem
                  value={option.value ?? `${option.label}-idx-${i}`}
                  id={option.id ?? option.value ?? option.label}
                  defaultChecked={option.value === initialValues}
                  defaultValue={defaultValue}
                />
              </Field>
            </FieldLabel>
          ))}
        </RadioGroup>
      ) : type === "multiple_select" ? (
        <div className="flex flex-col gap-1">
          {options.map((option) => {
            const val = option.value;
            if (!val) return null;
            return (
              <FieldLabel key={val} className="cursor-pointer hover:bg-gray-50">
                <Field orientation="horizontal">
                  <FieldContent>
                    <FieldTitle>{option.label}</FieldTitle>
                  </FieldContent>
                  <Checkbox
                    id={val}
                    defaultChecked={
                      !!defaultValue.split(",").find((v) => v === val)
                    }
                    onCheckedChange={(checked) =>
                      onCheckboxChange(val, checked === true)
                    }
                  />
                </Field>
              </FieldLabel>
            );
          })}
        </div>
      ) : (
        <InputContainer
          placeholder="Enter answer"
          value={defaultValue}
          onChange={(e) => onChangeText(e.target.value)}
        />
      )}
    </div>
  );
};

export default AnswerList;
