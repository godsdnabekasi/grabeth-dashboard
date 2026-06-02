import { memo, useCallback, useState } from "react";

import { ISelectedMember } from "@/components/page/church/member/container";
import { Avatar } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { cn, formatDate } from "@/lib/utils";
import { IUser } from "@/types/user";

interface IChurchMemberItem {
  member: IUser;
  isSelected: boolean;
  onToggle: (selected: ISelectedMember) => void;
}

const ChurchMemberItem = memo(
  ({ member, isSelected, onToggle }: IChurchMemberItem) => {
    const [selected, setSelected] = useState(isSelected);

    const handleToggle = useCallback(() => {
      const newSelected = !selected;
      setSelected(newSelected);
      onToggle({
        id: member.id,
        name: member.name,
        photo: member.user_file?.file?.link,
        joined_date: formatDate(new Date()),
        role: "mvp",
        selected: newSelected,
      });
    }, [
      onToggle,
      member.id,
      member.name,
      member.user_file?.file?.link,
      selected,
    ]);

    return (
      <div
        onClick={handleToggle}
        className={cn(
          "flex items-center justify-between py-2 group cursor-pointer rounded-lg transition-all duration-200 px-4 hover:bg-gray-50 active:scale-[0.99]",
          selected && "bg-gray-100 hover:bg-gray-50"
        )}
      >
        <div className="flex items-center gap-4">
          <Avatar
            src={member.user_file?.file?.link || ""}
            name={member.name}
            className="size-12 border-2 border-transparent"
          />
          <div className="flex flex-col gap-0.5">
            <span className="font-medium text-lg text-gray-900">
              {member.name}
            </span>
          </div>
        </div>
        <Checkbox
          checked={selected}
          onCheckedChange={handleToggle}
          onClick={(e) => e.stopPropagation()}
        />
      </div>
    );
  }
);

ChurchMemberItem.displayName = "ChurchMemberItem";

export default ChurchMemberItem;
