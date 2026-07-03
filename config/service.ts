import { SelectOption } from "@/components/ui/select-container";

export const QUESTION_TYPE: SelectOption[] = [
  {
    label: "Content",
    value: "content",
  },
  {
    label: "Video Content",
    value: "video_content",
  },
  {
    label: "Short Text",
    value: "short_text",
  },
  {
    label: "Long Text",
    value: "long_text",
  },
  {
    label: "Select",
    value: "select",
  },
  {
    label: "Multiple Select",
    value: "multiple_select",
  },
  {
    label: "Range",
    value: "range",
  },
];

export const QUESTION_DETAIL_TYPE = {
  content: {
    label: "Content",
  },
  video_content: {
    label: "Video Content",
  },
  short_text: {
    label: "Short Text",
  },
  long_text: {
    label: "Long Text",
  },
  select: {
    label: "Select",
  },
  multiple_select: {
    label: "Multiple Select",
  },
  range: {
    label: "Range",
  },
};
