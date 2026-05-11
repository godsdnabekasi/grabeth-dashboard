import { useCallback, useState } from "react";

import { EllipsisVertical, PlusCircle } from "lucide-react";

import { MemberFormValues, MemberReport } from "../types";
import MemberSettingModal, {
  ISelectedChangedMember,
  ISelectedRemoveMember,
} from "@/components/page/cool/member-setting-modal";
import ModalAddMember from "@/components/page/cool/modal-add-member";
import {
  formatMonthKey,
  useSmallGroupReport,
} from "@/components/page/cool/useCoolSummary";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { Image } from "@/components/ui/image";
import { formatDate } from "@/lib/utils";
import { SmallGroupRole } from "@/types/small-group";

interface IProps {
  members: MemberReport[];
  report: ReturnType<typeof useSmallGroupReport>;
  onAdd?: (selectedMembers: ISelectedMember[]) => void;
  onRemove?: (data: string[]) => void;
  onChanged?: (data: ISelectedChangedMember[]) => void;
}

export interface ISelectedMember extends MemberFormValues {
  selected?: boolean;
}

const CoolSummaryMember = ({
  members,
  report,
  onAdd,
  onRemove,
  onChanged,
}: IProps) => {
  const metCount = members.filter((m) => m.consistency === "konsisten").length;
  const cukupCount = members.filter((m) => m.consistency === "cukup").length;
  const jarangCount = members.filter((m) => m.consistency === "jarang").length;
  const tidakCount = members.filter(
    (m) => m.consistency === "tidak-konsisten"
  ).length;

  const [membersData, setMembersData] = useState<MemberReport[]>(
    report.members
  );
  const [isShowModal, setIsShowModal] = useState(false);
  const [isShowModalSetting, setIsShowModalSetting] = useState(false);
  const [selectedMember, setSelectedMember] = useState<
    ISelectedMember | undefined
  >(undefined);
  const [removedMembers, setRemovedMembers] = useState<string[]>([]);
  const [changedMembers, setChangedMembers] = useState<
    ISelectedChangedMember[]
  >([]);

  const handleOpenSettingModal = useCallback((member: MemberReport) => {
    setSelectedMember({
      ...member,
      id: member.id,
      name: member.name,
      image: member.avatarUrl,
      role: member.role,
      joinedDate: formatDate(member.joinedAt!),
      newRole: member.newRole,
      selected: false,
    });
    setIsShowModalSetting(true);
  }, []);

  const onSaveChanged = useCallback(
    (data: ISelectedChangedMember) => {
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
    (selectedMembers: ISelectedMember[]) => {
      const newMembers: MemberReport[] = selectedMembers.map((member) => ({
        id: member.id!,
        name: member.name!,
        avatarUrl: member.image || "",
        joinedAt: formatDate(new Date().toString()),
        role: member.role as SmallGroupRole,
      }));
      setMembersData((prev) => [...prev, ...newMembers]);
      onAdd?.(
        newMembers.map((member) => ({
          id: member.id,
          role: member.role,
          selected: true,
        }))
      );
      setIsShowModal(false);
    },
    [onAdd]
  );

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <div className="space-y-1">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">
            Members
          </p>
          <div className="flex gap-3 text-xs text-gray-400">
            {!!metCount && (
              <Badge className="bg-green-100 text-green-600">
                {metCount} konsisten
              </Badge>
            )}
            {!!cukupCount && (
              <Badge className="bg-violet-100 text-violet-600">
                {cukupCount} cukup
              </Badge>
            )}
            {!!jarangCount && (
              <Badge className="bg-amber-100 text-amber-600">
                {jarangCount} jarang
              </Badge>
            )}
            {!!tidakCount && (
              <Badge className="bg-red-100 text-red-600">
                {tidakCount} perlu peningkatan
              </Badge>
            )}
          </div>
        </div>

        <Button size="sm" onClick={() => setIsShowModal(true)}>
          <PlusCircle className="size-4" />
          Add New Member
        </Button>
      </div>

      <div>
        {membersData.length > 0 ? (
          membersData.map((member, i) => (
            <MemberRow
              key={member.id}
              member={member}
              months={report.months}
              index={i}
              onClick={handleOpenSettingModal}
            />
          ))
        ) : (
          <p className="text-sm text-gray-400 text-center py-6">
            Belum ada data member
          </p>
        )}
      </div>
      {report.months.length > 1 && (
        <div className="flex items-center gap-3 mt-4 pt-3 border-t border-gray-100">
          <p className="text-xs text-gray-400">Dot per bulan:</p>
          <span className="flex items-center gap-1 text-xs text-gray-400">
            <span className="w-2.5 h-2.5 rounded-full bg-green-500 inline-block" />
            Hadir ≥3x
          </span>
          <span className="flex items-center gap-1 text-xs text-gray-400">
            <span className="w-2.5 h-2.5 rounded-full bg-gray-200 inline-block" />
            Kurang dari 3x
          </span>
        </div>
      )}

      {isShowModal && (
        <Dialog open onOpenChange={setIsShowModal}>
          <ModalAddMember
            members={membersData.map((member) => member.id)}
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
  );
};

const CONSISTENCY_STYLES = {
  konsisten: {
    bar: "bg-green-600",
    label: "text-green-600",
    text: "Konsisten",
  },
  cukup: { bar: "bg-violet-600", label: "text-violet-600", text: "Cukup" },
  jarang: { bar: "bg-amber-600", label: "text-amber-600", text: "Jarang" },
  "tidak-konsisten": {
    bar: "bg-red-600",
    label: "text-red-600",
    text: "Perlu peningkatan",
  },
};

function MemberRow({
  member,
  months,
  index,
  onClick,
}: {
  member: MemberReport;
  months: string[];
  index: number;
  onClick: (member: MemberReport) => void;
}) {
  const consistency =
    CONSISTENCY_STYLES[member.consistency || "tidak-konsisten"];
  const ROLE_LABELS = {
    pastor: "Pastoral",
    mvp: "MVP",
    member: "Member",
    support: "Support",
    grower: "Grower",
  };

  function getRoleColor(role: SmallGroupRole) {
    switch (role) {
      case "pastor":
        return "bg-violet-100 text-violet-600";
      case "mvp":
        return "bg-green-100 text-green-600";
      case "member":
        return "bg-blue-100 text-blue-600";
      case "support":
        return "bg-amber-100 text-amber-600";
      case "grower":
        return "bg-red-100 text-red-600";
    }
  }

  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-gray-100 last:border-0">
      <Avatar
        name={member.name}
        avatarUrl={member.avatarUrl || ""}
        index={index}
      />

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">
          {member.name}
        </p>
        <p className="text-xs text-muted-foreground">
          <Badge className={getRoleColor(member.newRole || member.role)}>
            {ROLE_LABELS[member.newRole || member.role]}
          </Badge>{" "}
          • Joined {formatDate(member.joinedAt!)}
        </p>
      </div>

      {/* Dot attendance per month (only if multi-month) */}
      {months.length > 1 && (
        <div className="hidden sm:flex items-center gap-1">
          {months.map((mo) => {
            const met = (member.monthlyAttend?.[mo] ?? 0) >= 3;
            return (
              <span
                key={mo}
                title={`${formatMonthKey(mo)}: ${member.monthlyAttend?.[mo] ?? 0}x`}
                className={`w-2.5 h-2.5 rounded-full ${met ? "bg-green-500" : "bg-gray-200"}`}
              />
            );
          })}
        </div>
      )}

      {/* Consistency bar + label */}
      <div className="w-42 shrink-0">
        <p className={`text-xs mb-1 font-medium ${consistency.label}`}>
          {consistency.text} • ({member.totalAttend}x hadir)
        </p>
        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full ${consistency.bar}`}
            style={{ width: `${member.attendancePct}%` }}
          />
        </div>
      </div>

      <Button
        variant="outline"
        size="icon-sm"
        onClick={() => onClick(member as MemberReport)}
      >
        <EllipsisVertical className="size-4" />
      </Button>
    </div>
  );
}

function Avatar({
  name,
  avatarUrl,
  index,
}: {
  name: string;
  avatarUrl: string | null;
  index: number;
}) {
  const AVATAR_COLORS = [
    "bg-blue-100 text-blue-800",
    "bg-teal-100 text-teal-800",
    "bg-violet-100 text-violet-800",
    "bg-pink-100 text-pink-800",
    "bg-amber-100 text-amber-800",
    "bg-green-100 text-green-800",
  ];
  const colorClass = AVATAR_COLORS[index % AVATAR_COLORS.length];
  function getInitials(name: string): string {
    return name
      .split(" ")
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase() ?? "")
      .join("");
  }

  if (avatarUrl) {
    return (
      <Image
        src={avatarUrl}
        alt={name}
        width={40}
        height={40}
        className="w-9 h-9 rounded-full object-cover shrink-0"
        onError={(e) => {
          const el = e.currentTarget;
          el.style.display = "none";
          el.nextElementSibling?.classList.remove("hidden");
        }}
      />
    );
  }

  return (
    <div
      className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 ${colorClass}`}
    >
      {getInitials(name)}
    </div>
  );
}

export default CoolSummaryMember;
