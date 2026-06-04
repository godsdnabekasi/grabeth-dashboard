import React, { useCallback, useEffect, useState } from "react";

import { CirclePlus, EllipsisVertical, Users } from "lucide-react";
import { useParams } from "next/navigation";
import { toast } from "sonner";

import {
  IChurchMemberContainer,
  ISelectedMember,
} from "@/components/page/church/member/container";
import MemberSettingModal from "@/components/page/church/member/member-setting-modal";
import ChurchModalAddMember from "@/components/page/church/member/modal-add-member";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import EmptySection from "@/components/ui/empty-section";
import FormSection from "@/components/ui/form/section";
import { CHURCH_USER_ROLES } from "@/config/common";
import { formatDate } from "@/lib/utils";
import { getChurchUsers } from "@/service/church";

interface IChurchPastorContainerProps {
  onAddPastor?: (pastors: ISelectedMember[]) => void;
  onRemovePastor?: (pastorIds: string[]) => void;
  onChangeRole?: (member: ISelectedMember) => void;
}

const ChurchPastoral = ({
  onAddPastor,
  onRemovePastor,
  onChangeRole,
}: IChurchPastorContainerProps) => {
  const params = useParams();
  const churchId = Number(params.id);
  const [pastors, setPastors] = useState<IChurchMemberContainer[]>([]);
  const [openModalAddMember, setOpenModalAddMember] = useState(false);
  const [openSettingModal, setOpenSettingModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState<ISelectedMember>();
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
  const [deletedMemberIds, setDeletedMemberIds] = useState<string[]>([]);

  const fetchPastors = useCallback(async () => {
    try {
      const { data: dataPastors, error: errorPastors } = await getChurchUsers({
        church_id: churchId,
        not_role: "user",
      });
      if (errorPastors) throw errorPastors;

      if (dataPastors) {
        setPastors(
          dataPastors.map((d) => ({
            id: d.user!.id!,
            name: d.user!.name!,
            role: d.role,
            photo: d.user?.user_file?.file?.link,
            joined_date: formatDate(d.created_at!),
          }))
        );
      }
    } catch {
      toast.error("Failed to fetch pastors");
    }
  }, [churchId]);

  const handleSettingModal = useCallback((member: ISelectedMember) => {
    setOpenSettingModal(true);
    setSelectedMember(member);
  }, []);

  const handleAddMember = useCallback(
    (selectedMembers: ISelectedMember[]) => {
      const newPastor = selectedMembers.map((member) => ({
        id: member.id!,
        name: member.name!,
        photo: member.photo || "",
        joined_date: formatDate(new Date()),
        role: "pastor",
      })) as ISelectedMember[];
      const currentPastors = [...pastors, ...newPastor];
      setPastors(currentPastors);
      setSelectedMemberIds(currentPastors.map((cp) => cp.id));
      onAddPastor?.(currentPastors);
      setOpenModalAddMember(false);
    },
    [onAddPastor, pastors]
  );

  const onDelete = useCallback(
    (user_id: string) => {
      const deletedPastors = [...deletedMemberIds, user_id];
      const currentPastors = pastors.filter((m) => m.id !== user_id);

      setPastors(currentPastors);
      setSelectedMemberIds(currentPastors.map((cp) => cp.id));

      setDeletedMemberIds(deletedPastors);
      onRemovePastor?.(deletedPastors);
    },
    [deletedMemberIds, onRemovePastor, pastors]
  );

  const handleSaveChangedMember = useCallback(
    (m: ISelectedMember) => {
      const updatedPastors = pastors.map((p) => {
        if (p.id === m.id) {
          return { ...p, role: m.newRole };
        }
        return p;
      }) as IChurchMemberContainer[];
      setPastors(updatedPastors);
      setOpenSettingModal(false);
      onChangeRole?.(m);
    },
    [onChangeRole, pastors]
  );

  useEffect(() => {
    fetchPastors();
  }, [fetchPastors]);

  return (
    <>
      <FormSection
        title="Pastors"
        description="Manage church pastors"
        icon={Users}
        action={
          <Button size="md" onClick={() => setOpenModalAddMember(true)}>
            <CirclePlus />
            Add Pastor
          </Button>
        }
      >
        {pastors.length === 0 ? (
          <Card>
            <EmptySection icon={Users} message="No pastors found" />
          </Card>
        ) : (
          <div className="grid grid-cols-4 gap-4">
            {pastors.map((pastor) => (
              <Card
                key={pastor.id}
                contentClassName="flex flex-col items-center gap-2 relative"
              >
                <CardHeader>
                  <Button
                    variant="outline"
                    size="icon-sm"
                    id={pastor.id}
                    className="absolute -top-3 right-2"
                    onClick={() => handleSettingModal(pastor)}
                  >
                    <EllipsisVertical />
                  </Button>
                </CardHeader>
                <Avatar
                  src={pastor.photo || ""}
                  name={pastor.name}
                  alt={pastor.name}
                  className="size-20"
                />
                <div className="flex flex-col items-center gap-2">
                  <p className="font-semibold text-center">{pastor.name}</p>
                  <Badge
                    className="capitalize font-semibold"
                    style={{
                      backgroundColor: CHURCH_USER_ROLES[pastor.role].color,
                    }}
                  >
                    {CHURCH_USER_ROLES[pastor.role].label}
                  </Badge>
                </div>
              </Card>
            ))}
          </div>
        )}
      </FormSection>

      {openSettingModal && (
        <MemberSettingModal
          isShowModal={openSettingModal}
          member={selectedMember}
          roles={CHURCH_USER_ROLES}
          title="Team Member Settings"
          removeLabel="Remove from workspace"
          removeDescription="They will lose access to all shared resources."
          setIsShowModal={setOpenSettingModal}
          onSave={handleSaveChangedMember}
          onRemove={onDelete}
        />
      )}

      {openModalAddMember && (
        <ChurchModalAddMember
          open={openModalAddMember}
          onOpenChange={setOpenModalAddMember}
          members={selectedMemberIds}
          onAdd={handleAddMember}
        />
      )}
    </>
  );
};

export default ChurchPastoral;
