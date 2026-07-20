import React, { useCallback, useState } from "react";

import { useRouter } from "next/navigation";

import { ColumnDef } from "@tanstack/react-table";

import { fetchParticipantDetailAction } from "@/app/(main)/quiz/_components/user/actions";
import { ClassUserResult } from "@/app/(main)/quiz/_components/user/participantDetail";
import { ParticipantDetailModal } from "@/app/(main)/quiz/_components/user/user-detail-modal";
import { DataTable } from "@/components/ui/data-table";
import { Progress } from "@/components/ui/progress";
import { useDebounce } from "@/hooks/use-debounce";
import { IClassUserAnswerSummary } from "@/types/class";
import { IQuiz } from "@/types/quiz";

export interface IDataTable {
  name: string;
  total_percentage: number;
  total_score?: number;
  total_point?: number;
  answered_questions?: string;
  duration_seconds?: string;
  classId: number;
}

const parentColumns: ColumnDef<IDataTable>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "total_score",
    header: "Total Score",
    cell: ({ row }) => (
      <div className="flex gap-2 items-center">
        <Progress value={row.original.total_percentage} />
        <p className="text-xs text-muted-foreground">
          {row.original.total_score}/{row.original.total_point}
        </p>
      </div>
    ),
  },
  {
    accessorKey: "answered_questions",
    header: "Answered Question",
  },
  {
    accessorKey: "duration_seconds",
    header: "Duration (seconds)",
  },
];

const UserList = ({
  classUserAnswer,
}: {
  classUserAnswer: IClassUserAnswerSummary[];
}) => {
  const router = useRouter();

  const [items, setItems] =
    useState<IClassUserAnswerSummary[]>(classUserAnswer);
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState<string>();
  const debouncedSearch = useDebounce(search, 300);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [selected, setSelected] = useState<
    (ClassUserResult & { classId: number }) | null
  >(null);

  const transformData = useCallback((data: IClassUserAnswerSummary[]) => {
    return data.map((item) => ({
      name: item.user.name,
      total_percentage: (item.total_score / item.total_point) * 100,
      total_score: item.total_score,
      total_point: item.total_point,
      answered_questions: `${item.answered_questions}/${item.total_questions} questions`,
      duration_seconds: `${item.duration_seconds} secs`,
      classId: item.class_id,
    }));
  }, []);

  const handleRowClick = useCallback((data: IDataTable) => {
    setSelected({
      userId: String(data.classId),
      userName: data.name,
      userNickname: data.name,
      userNij: "",
      scoreLabel: data.total_score?.toString() ?? "",
      scorePercent: data.total_percentage,
      totalScore: data.total_score ?? 0,
      totalPoint: data.total_point ?? 0,
      startedAt: new Date(),
      finishedAt: new Date(),
      durationLabel: "",
      submitDateLabel: "",
      classId: data.classId,
    });
    setModalOpen(true);
  }, []);

  return (
    <div>
      <DataTable
        columns={parentColumns}
        data={transformData(items)}
        loading={isLoading}
        searchKey="name"
        page={page}
        pageSize={pageSize}
        totalCount={totalCount}
        showPagination
        emptyMessage="No Quiz found."
        onRowClick={handleRowClick}
        // onDeleteRow={onDelete}
        onSearch={setSearch}
        // onPaginationChange={handlePaginationChange}
      />

      {modalOpen && (
        <ParticipantDetailModal
          open={modalOpen}
          onOpenChange={setModalOpen}
          classId={Number(selected?.classId)}
          participant={selected}
          fetchDetail={fetchParticipantDetailAction}
        />
      )}
    </div>
  );
};

export default UserList;
