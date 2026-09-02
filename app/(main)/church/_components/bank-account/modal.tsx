import { useParams } from "next/navigation";
import { useForm } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";

import {
  BankAccountFormValues,
  bankAccountSchema,
} from "@/app/(main)/church/_types/bank";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { InputImage } from "@/components/ui/input-image";
import { Select } from "@/components/ui/select";
import { BANK_ACCOUNT_SELECT } from "@/config/bank";

interface ChurchBankAccountModalProps {
  initialValues?: BankAccountFormValues;
  isShowModal: boolean;
  mode?: "create" | "edit";
  setIsShowModal: (val: boolean) => void;
  handleSave: (value: BankAccountFormValues) => void;
}

const ChurchBankAccountModal = ({
  initialValues,
  isShowModal,
  mode = "create",
  setIsShowModal,
  handleSave,
}: ChurchBankAccountModalProps) => {
  const params = useParams();
  const churchId = Number(params.id);
  const { control, handleSubmit, watch } = useForm<BankAccountFormValues>({
    resolver: zodResolver(bankAccountSchema),
    defaultValues: initialValues || {
      name: "",
      church_id: churchId,
    },
  });

  // eslint-disable-next-line react-hooks/incompatible-library
  const selectedType = watch("bank");

  const onSubmit = (data: BankAccountFormValues) => {
    handleSave(data);
    setIsShowModal(false);
  };

  return (
    <Dialog open={isShowModal} onOpenChange={setIsShowModal}>
      <DialogContent className="max-h-[90vh] md:max-w-xl gap-0 p-0">
        <DialogHeader
          title={mode === "create" ? "Add Bank Account" : "Edit Bank Account"}
          showCloseButton
          className="px-4 py-5 flex-row"
        />

        <div className="p-4 grid grid-cols-2 gap-4">
          <Input
            label="Account Name"
            name="name"
            control={control}
            placeholder="e.g. GBI Church Name"
          />
          <Select
            label="Bank"
            name="bank"
            control={control}
            placeholder="e.g. BCA, Mandiri, BNI"
            options={BANK_ACCOUNT_SELECT}
          />
          <Input
            label={selectedType === "qris" ? "Merchant PAN" : "Account Number"}
            name="account_number"
            control={control}
            placeholder="e.g. 1234567890"
            type="number"
          />
          {selectedType === "qris" && (
            <InputImage
              label="QRIS"
              name="qris"
              control={control}
              recommendedSize="1080x1080px (1:1)"
              className="aspect-square"
            />
          )}
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" size="md">
              Cancel
            </Button>
          </DialogClose>
          <Button size="md" onClick={handleSubmit(onSubmit)}>
            {mode === "create" ? "Save" : "Update"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ChurchBankAccountModal;
