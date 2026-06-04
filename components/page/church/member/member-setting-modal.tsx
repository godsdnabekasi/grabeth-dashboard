// MemberSettingModal.tsx — generic, reusable version
import { useCallback, useState } from "react";

import { ISelectedMember } from "@/components/page/church/member/container";
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
import { TChurchUserRole } from "@/types/church";

// ─── Generic role shape ───────────────────────────────────────────────────────

export interface IRoleConfig {
  label: string;
  description?: string;
  color: string;
}

// ─── Event payloads ───────────────────────────────────────────────────────────

export interface IChangedMemberPayload extends ISelectedMember {
  selected?: boolean;
  newRole?: TChurchUserRole;
}

// ─── Props ───────────────────────────────────────────────────────────────────

interface IMemberSettingModalProps {
  isShowModal: boolean;
  member?: ISelectedMember;
  /** Map of roleKey → display config */
  roles: Record<string, IRoleConfig>;
  /** Override the modal header title (default: "Member Settings") */
  title?: string;
  /** Override the remove-button label (default: "Remove member") */
  removeLabel?: string;
  /** Override the remove-section description */
  removeDescription?: string;
  setIsShowModal: (val: boolean) => void;
  onSave?: (payload: ISelectedMember) => void;
  onRemove?: (payload: string) => void;
}

// ─── Component ───────────────────────────────────────────────────────────────

function MemberSettingModal({
  isShowModal,
  member,
  roles,
  title = "Member Settings",
  removeLabel = "Remove member",
  removeDescription = "This member will lose access.",
  setIsShowModal,
  onSave,
  onRemove,
}: IMemberSettingModalProps) {
  const effectiveRole = (member?.newRole ?? member?.role) as TChurchUserRole;

  const [selectedRole, setSelectedRole] =
    useState<TChurchUserRole>(effectiveRole);

  const roleConfig = roles[effectiveRole];

  const handleSave = useCallback(() => {
    if (!member) return;
    onSave?.({ ...member, newRole: selectedRole });
  }, [onSave, member, selectedRole]);

  const handleRemove = useCallback(() => {
    if (!member) return;
    onRemove?.(member.id);
  }, [member, onRemove]);

  return (
    <Dialog open={isShowModal} onOpenChange={setIsShowModal}>
      <DialogContent className="max-h-[90vh] md:max-w-xl gap-0 p-0 overflow-hidden border-none rounded-2xl shadow-2xl">
        <DialogHeader
          title={title}
          showCloseButton
          className="px-4 py-5 flex-row"
        />

        <div className="px-6 py-5 space-y-6 h-full overflow-y-auto">
          {/* Member info */}
          <div className="flex flex-row gap-4 items-center">
            <Avatar
              src={member?.photo ?? ""}
              name={member?.name}
              className="size-16"
            />
            <div className="space-y-1">
              <h3 className="text-base font-semibold">{member?.name}</h3>
              {roleConfig && (
                <Badge
                  className="capitalize font-semibold"
                  style={{ backgroundColor: roleConfig.color }}
                >
                  {roleConfig.label}
                </Badge>
              )}
            </div>
          </div>

          {/* Role selector */}
          <div className="space-y-3">
            <h3 className="text-base font-semibold">Change Role</h3>
            <RadioGroup
              value={selectedRole} // controlled — reflects live selection
              onValueChange={(val) => setSelectedRole(val as TChurchUserRole)}
            >
              {Object.entries(roles).map(([key, config]) => (
                <FieldLabel
                  key={key}
                  htmlFor={key}
                  className="cursor-pointer hover:bg-gray-50"
                >
                  <Field orientation="horizontal">
                    <FieldContent>
                      <FieldTitle>{config.label}</FieldTitle>
                      <FieldDescription>{config.description}</FieldDescription>
                    </FieldContent>
                    <RadioGroupItem value={key} id={key} />
                  </Field>
                </FieldLabel>
              ))}
            </RadioGroup>
          </div>

          <Separator />

          {/* Remove member */}
          <div className="space-y-4">
            <div className="space-y-1">
              <h3 className="text-base font-semibold">Remove Member</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {removeDescription}
              </p>
            </div>
            <Button
              variant="destructiveOutline"
              size="md"
              className="w-full"
              onClick={handleRemove}
            >
              {removeLabel}
            </Button>
          </div>
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" size="md">
              Cancel
            </Button>
          </DialogClose>
          <Button size="md" onClick={handleSave}>
            Change
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default MemberSettingModal;
