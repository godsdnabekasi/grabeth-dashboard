import React, { useState } from "react";

import { Pencil, Plus, Trash2, Users } from "lucide-react";

import ChurchBankAccountModal from "@/app/(main)/church/_components/bank-account/modal";
import { BankAccountFormValues } from "@/app/(main)/church/_types/bank";
import Alert from "@/components/ui/alert";
import { AlertDialogCancel } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import EmptySection from "@/components/ui/empty-section";
import FormSection from "@/components/ui/form/section";
import { Image } from "@/components/ui/image";
import { BANK_ACCOUNT } from "@/config/bank";

interface IChurchBankAccountContainerProps {
  initialValues?: BankAccountFormValues[];
  onRemove?: (service: BankAccountFormValues) => void;
  onChange?: (service: BankAccountFormValues) => void;
}

const ChurchBankAcoountContainer = ({
  initialValues = [],
  onRemove,
  onChange,
}: IChurchBankAccountContainerProps) => {
  const [selected, setSelected] = useState<BankAccountFormValues | undefined>(
    undefined
  );
  const [openModal, setOpenModal] = useState(false);

  const handleEditService = (val: BankAccountFormValues) => {
    setSelected(val);
    setOpenModal(true);
  };

  const handleAddService = () => {
    setSelected(undefined);
    setOpenModal(true);
  };

  const handleSave = (val: BankAccountFormValues) => {
    onChange!(val);
    setOpenModal(false);
  };

  return (
    <FormSection
      title="Bank Account Information"
      description="Manage church bank accounts"
      icon={Users}
      action={
        <Button size="md" onClick={handleAddService}>
          <Plus />
          Add Bank Account
        </Button>
      }
    >
      {initialValues?.length === 0 ? (
        <Card>
          <EmptySection message="No bank accounts found" />
        </Card>
      ) : (
        <div className="grid grid-cols-3 lg:grid-cols-4 gap-4">
          {initialValues?.map((item, i) => (
            <Card
              key={i}
              contentClassName="p-0 flex-1"
              className="p-0"
              footerClassName="p-4 justify-end gap-2"
              footer={
                <>
                  <Alert
                    title="Are you sure?"
                    description="This action cannot be undone."
                    trigger={
                      <Button variant="destructiveOutline" size="icon">
                        <Trash2 className="size-4" />
                      </Button>
                    }
                    footer={
                      <>
                        <AlertDialogCancel asChild>
                          <Button variant="outline">Cancel</Button>
                        </AlertDialogCancel>
                        <AlertDialogCancel asChild>
                          <Button
                            variant="destructive"
                            onClick={() => onRemove?.(item)}
                          >
                            Delete
                          </Button>
                        </AlertDialogCancel>
                      </>
                    }
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleEditService(item)}
                  >
                    <Pencil className="size-4" />
                  </Button>
                </>
              }
            >
              <CardHeader className="p-4 border-b border-b-border">
                <span className="flex items-center gap-2">
                  <Image
                    src={BANK_ACCOUNT[item.bank].image}
                    alt={BANK_ACCOUNT[item.bank].label}
                    width={32}
                    height={32}
                  />
                  <span className="font-semibold">
                    {BANK_ACCOUNT[item.bank].label}
                  </span>
                </span>
              </CardHeader>
              <div className="flex-1 flex flex-col p-4 gap-1">
                <h3 className="font-semibold text-sm">{item.name}</h3>
                {item.account_number && (
                  <span className="flex items-center gap-1 text-sm text-muted-foreground">
                    {item.account_number}
                  </span>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {openModal && (
        <ChurchBankAccountModal
          initialValues={selected}
          isShowModal={openModal}
          setIsShowModal={setOpenModal}
          handleSave={handleSave}
          mode={selected ? "edit" : "create"}
        />
      )}
    </FormSection>
  );
};

export default ChurchBankAcoountContainer;
