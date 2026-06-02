import React, { useCallback, useEffect, useState } from "react";

import {
  CirclePlus,
  EllipsisVertical,
  SquarePen,
  Trash2,
  Users,
} from "lucide-react";
import { useParams } from "next/navigation";
import { toast } from "sonner";

import {
  IChurchMemberContainer,
  ISelectedMember,
} from "@/components/page/church/member/container";
import ChurchModalAddMember from "@/components/page/church/member/modal-add-member";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import FormSection from "@/components/ui/form/section";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { formatDate } from "@/lib/utils";
import { getChurchUsers } from "@/service/church";

interface IChurchPastorContainerProps {
  onAddPastor?: (pastors: ISelectedMember[]) => void;
  onRemovePastor?: (pastorIds: string[]) => void;
}

const ChurchPastoral = ({
  onAddPastor,
  onRemovePastor,
}: IChurchPastorContainerProps) => {
  const params = useParams();
  const churchId = Number(params.id);
  const [pastors, setPastors] = useState<IChurchMemberContainer[]>([]);
  const [openModalAddMember, setOpenModalAddMember] = useState(false);
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
        <div className="grid grid-cols-4 gap-4">
          {pastors.map((pastor) => (
            <Card
              key={pastor.id}
              contentClassName="flex flex-col items-center gap-2 relative"
            >
              <CardHeader>
                <Popover>
                  <PopoverTrigger asChild className="absolute -top-3 right-2">
                    <Button
                      variant="outline"
                      size="icon"
                      id={pastor.id}
                      className="absolute -top-3 right-2"
                    >
                      <EllipsisVertical />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="overflow-hidden px-0 py-1 w-auto"
                    align="start"
                  >
                    <div className="flex flex-col gap-1">
                      <Button
                        variant="ghost"
                        className="w-full justify-start px-3"
                      >
                        <SquarePen className="size-4" />
                        Change Role
                      </Button>
                      <Button
                        variant="ghost"
                        className="w-full justify-start px-3 text-destructive"
                        onClick={() => onDelete(pastor.id)}
                      >
                        <Trash2 className="size-4" />
                        Remove
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>
              </CardHeader>
              <Avatar
                src={pastor.photo || ""}
                name={pastor.name}
                alt={pastor.name}
                className="size-20"
              />
              <div className="flex flex-col items-center gap-2">
                <p className="font-semibold text-center">{pastor.name}</p>
                <Badge className="capitalize font-semibold">
                  {pastor.role}
                </Badge>
              </div>
            </Card>
          ))}
        </div>
      </FormSection>

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
