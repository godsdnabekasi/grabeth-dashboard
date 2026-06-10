import { StaticImageData } from "next/image";

import bca from "@/assets/images/bank/bca.png";
import bni from "@/assets/images/bank/bni.png";
import bri from "@/assets/images/bank/bri.png";
import cimb from "@/assets/images/bank/cimb.png";
import mandiri from "@/assets/images/bank/mandiri.png";
import permata from "@/assets/images/bank/permata.png";
import { SelectOption } from "@/components/ui/select-container";
import { TChurchBankName } from "@/types/church";

export const BANK_ACCOUNT: Record<
  TChurchBankName,
  { label: string; image: StaticImageData }
> = {
  bca: {
    label: "BCA",
    image: bca,
  },
  bni: {
    label: "BNI",
    image: bni,
  },
  bri: {
    label: "BRI",
    image: bri,
  },
  mandiri: {
    label: "Mandiri",
    image: mandiri,
  },
  cimb: {
    label: "CIMB",
    image: cimb,
  },
  permata: {
    label: "Permata",
    image: permata,
  },
};

export const BANK_ACCOUNT_SELECT: SelectOption[] = Object.entries(
  BANK_ACCOUNT
).map(([value, label]) => ({
  value,
  label: label.label,
}));
