import { useCallback, useState } from "react";

import { EllipsisVertical, PlusCircle, Users2 } from "lucide-react";

import MemberSettingModal, {
  ISelectedRemoveMember,
} from "../member/member-setting-modal";
import ModalAddMember from "../member/modal-add-member";
import MemberRow from "@/app/(main)/cool/_components/member/member-row";
import CoolSection from "@/app/(main)/cool/_components/section";
import { ICoolMember } from "@/app/(main)/cool/_types/member";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { formatDate } from "@/lib/utils";
import { SmallGroupRole } from "@/types/small-group";

interface IProps {
  members: ICoolMember[];
  onAdd?: (selectedMembers: ICoolMember[]) => void;
  onRemove?: (data: string[]) => void;
  onChanged?: (data: ICoolMember[]) => void;
}

const CoolMember = ({ members, onAdd, onRemove, onChanged }: IProps) => {
  const [membersData, setMembersData] = useState<ICoolMember[]>(members || []);
  const [isShowModal, setIsShowModal] = useState(false);
  const [isShowModalSetting, setIsShowModalSetting] = useState(false);
  const [selectedMember, setSelectedMember] = useState<ICoolMember | undefined>(
    undefined
  );
  const [removedMembers, setRemovedMembers] = useState<string[]>([]);
  const [changedMembers, setChangedMembers] = useState<ICoolMember[]>([]);

  const handleOpenSettingModal = useCallback((member: ICoolMember) => {
    setSelectedMember({
      ...member,
      id: member.id,
      name: member.name,
      image: member.image,
      role: member.role,
      joinedDate: formatDate(member.joinedDate!),
      newRole: member.newRole,
      selected: false,
    });
    setIsShowModalSetting(true);
  }, []);

  const onSaveChanged = useCallback(
    (data: ICoolMember) => {
      const isExist = changedMembers.some((member) => member.id === data.id);
      const memberChanged = isExist
        ? changedMembers.map((member) =>
            member.id === data.id ? data : member
          )
        : [...changedMembers, data];

      setChangedMembers(memberChanged);
      onChanged?.(memberChanged);
      setMembersData(
        membersData.map((member) =>
          member.id === data.id ? { ...member, newRole: data.newRole } : member
        )
      );
      setIsShowModalSetting(false);
    },
    [changedMembers, membersData, onChanged]
  );

  const onRemoveMember = useCallback(
    (data: ISelectedRemoveMember) => {
      const newRemovedMembers = [...removedMembers, data.id];
      setRemovedMembers(newRemovedMembers);
      onRemove?.(newRemovedMembers);
      setMembersData(membersData.filter((member) => member.id !== data.id));
      setIsShowModalSetting(false);
    },
    [removedMembers, onRemove, membersData]
  );

  const onAddMember = useCallback(
    (selectedMembers: ICoolMember[]) => {
      const newMembers: ICoolMember[] = selectedMembers.map((member) => ({
        ...member,
        joinedDate: formatDate(new Date().toString()),
        role: member.role as SmallGroupRole,
      }));
      setMembersData((prev) => [...prev, ...newMembers]);
      onAdd?.(
        newMembers.map((member) => ({
          ...member,
          selected: true,
        }))
      );
      setIsShowModal(false);
    },
    [onAdd]
  );

  return (
    <CoolSection
      title="Members"
      description="Add members to your COOL"
      icon={Users2}
      action={
        <Button size="sm" onClick={() => setIsShowModal(true)}>
          <PlusCircle className="size-4" />
          Add New Member
        </Button>
      }
    >
      <Card>
        {membersData.length > 0 ? (
          membersData.map((member) => (
            <MemberRow
              key={member.id}
              member={member}
              action={
                <Button
                  variant="outline"
                  size="icon-sm"
                  onClick={() => handleOpenSettingModal(member as ICoolMember)}
                >
                  <EllipsisVertical className="size-4" />
                </Button>
              }
            />
          ))
        ) : (
          <p className="text-sm text-gray-400 text-center py-6">
            Belum ada data member
          </p>
        )}

        {isShowModal && (
          <Dialog open onOpenChange={setIsShowModal}>
            <ModalAddMember
              members={membersData.map((member) => member.id!)}
              onAdd={onAddMember}
            />
          </Dialog>
        )}

        {isShowModalSetting && (
          <MemberSettingModal
            isShowModal={isShowModalSetting}
            member={selectedMember}
            setIsShowModal={setIsShowModalSetting}
            onSave={onSaveChanged}
            onRemove={onRemoveMember}
          />
        )}
      </Card>
    </CoolSection>
  );
};

export default CoolMember;
