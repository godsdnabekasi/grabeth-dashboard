import { ICoolMember } from "@/app/(main)/cool/_types/member";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { SmallGroupRole } from "@/types/small-group";

const MemberRow = ({
  member,
  action,
}: {
  member: ICoolMember;
  action?: React.ReactNode;
}) => {
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
    <div className="flex items-center gap-3 border-b border-gray-100 first:pt-0 last:pb-0 py-2 last:border-0">
      <Avatar name={member.name || ""} src={member.image || ""} />

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">
          {member.name}
        </p>
        <p className="text-xs text-muted-foreground">
          <Badge className={getRoleColor(member.newRole || member.role)}>
            {ROLE_LABELS[member.newRole || member.role]}
          </Badge>{" "}
          • Joined {formatDate(member.joinedDate!)}
        </p>
      </div>

      {action}
    </div>
  );
};

export default MemberRow;
