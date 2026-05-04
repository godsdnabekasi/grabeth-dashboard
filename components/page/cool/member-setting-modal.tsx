import React, { useCallback, useState } from "react";

import { ISelectedMember } from "@/components/page/cool/member-item";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
} from "@/components/ui/dialog";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
  FieldTitle,
} from "@/components/ui/field";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { SMALL_GROUP_ROLES } from "@/config/common";
import { CoolUserRole } from "@/types/small-group";

interface IMemberSettingModal {
  isShowModal: boolean;
  member?: ISelectedMember;
  setIsShowModal: (val: boolean) => void;
  onSave?: (data: ISelectedChangedMember) => void;
  onRemove?: (data: ISelectedRemoveMember) => void;
}

export interface ISelectedChangedMember extends ISelectedMember {
  newRole: CoolUserRole;
}

export interface ISelectedRemoveMember {
  id: string;
  removed: boolean;
}

const MemberSettingModal = ({
  isShowModal,
  member,
  setIsShowModal,
  onSave,
  onRemove,
}: IMemberSettingModal) => {
  const [selectedRole, setSelectedRole] = useState<CoolUserRole>(
    member?.role as CoolUserRole
  );
  const role = member?.newRole || member?.role;

  const onSaveChanged = useCallback(() => {
    console.log(selectedRole);

    onSave?.({
      ...(member as ISelectedChangedMember),
      id: member?.id as string,
      newRole: selectedRole,
    });
  }, [onSave, member, selectedRole]);

  const onRemoveMember = useCallback(() => {
    onRemove?.({
      id: member?.id as string,
      removed: true,
    });
  }, [member?.id, onRemove]);

  return (
    <Dialog open={isShowModal} onOpenChange={setIsShowModal}>
      <DialogContent className="max-h-[90vh] md:max-w-xl gap-0 p-0 overflow-hidden border-none rounded-2xl shadow-2xl">
        <DialogHeader
          title="Member Settings"
          showCloseButton
          className="px-4 py-5 flex-row"
        />
        <div className="px-6 py-5 space-y-6 h-full overflow-y-auto">
          <div className="flex flex-row gap-4 items-center">
            <Avatar
              src={member?.image || ""}
              name={member?.name}
              className="size-16"
            />
            <div className="space-y-1">
              <h3 className="text-base font-semibold">{member?.name}</h3>
              <Badge
                className="capitalize font-semibold"
                style={{
                  backgroundColor:
                    SMALL_GROUP_ROLES[role as CoolUserRole]?.color,
                }}
              >
                {SMALL_GROUP_ROLES[role as CoolUserRole]?.label}
              </Badge>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-base font-semibold">Change Role</h3>
            <div className="space-y-3">
              <RadioGroup
                defaultValue={role}
                onValueChange={(value) =>
                  setSelectedRole(value as CoolUserRole)
                }
              >
                {Object.entries(SMALL_GROUP_ROLES).map(([key, value]) => (
                  <FieldLabel
                    key={key}
                    htmlFor={key}
                    className="cursor-pointer hover:bg-gray-50"
                  >
                    <Field orientation="horizontal">
                      <FieldContent>
                        <FieldTitle>{value.label}</FieldTitle>
                        <FieldDescription>{value.description}</FieldDescription>
                      </FieldContent>
                      <RadioGroupItem value={key} id={key} />
                    </Field>
                  </FieldLabel>
                ))}
              </RadioGroup>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="space-y-1">
              <h3 className="text-base font-semibold">Remove Member</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                This member will no longer have access to this COOL.
              </p>
            </div>
            <Button
              variant="destructiveOutline"
              size="md"
              className="w-full"
              onClick={onRemoveMember}
            >
              Remove from COOL
            </Button>
          </div>
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" size="md">
              Cancel
            </Button>
          </DialogClose>
          <Button size="md" onClick={onSaveChanged}>
            Change
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default MemberSettingModal;
