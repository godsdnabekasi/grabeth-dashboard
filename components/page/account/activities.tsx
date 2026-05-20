import { Fragment, useCallback, useEffect, useState } from "react";

import {
  Book,
  CalendarDays,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  LucideIcon,
  Notebook,
  Rocket,
  Users,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import FormSection from "@/components/ui/form/section";
import LoadingSection from "@/components/ui/loading-section";
import { Separator } from "@/components/ui/separator";
import { cn, formatDateAgo } from "@/lib/utils";
import { getUserActivities } from "@/service/user";
import { IUserActivity, UserActivityType } from "@/types/user";

type ActivityIconConfig = {
  icon: LucideIcon;
  class: string;
};

const ACTIVITY_ICON: Record<UserActivityType, ActivityIconConfig> = {
  "join date": { icon: CalendarDays, class: "bg-purple-100 text-purple-600" },
  "join community": { icon: Users, class: "bg-blue-100 text-blue-600" },
  attendance: { icon: CheckCircle, class: "bg-green-100 text-green-600" },
  devotion: { icon: Book, class: "bg-yellow-100 text-yellow-600" },
  note: { icon: Notebook, class: "bg-purple-100 text-purple-600" },
  community: { icon: Users, class: "bg-pink-100 text-pink-600" },
};

interface IProps {
  id: string;
  activities?: IUserActivity[];
}

const ActivitiesSection = ({ id, activities }: IProps) => {
  const [data, setData] = useState<IUserActivity[]>(activities ?? []);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 5;
  const [totalCount, setTotalCount] = useState(0);

  const fetchActivities = useCallback(async () => {
    if (!id) return;

    try {
      setIsLoading(true);
      const {
        data: result,
        error,
        count,
      } = await getUserActivities(id, {
        page,
        pageSize,
      });
      if (error) throw error;
      setData(result ?? []);
      setTotalCount(count ?? 0);
    } catch (error) {
      toast.error((error as Error)?.message || "Failed to fetch activities");
    } finally {
      setIsLoading(false);
    }
  }, [id, page, pageSize]);

  const onNext = useCallback(() => {
    if (page < Math.ceil(totalCount / pageSize)) {
      setPage((prev) => prev + 1);
    }
  }, [page, pageSize, totalCount]);

  const onPrevious = useCallback(() => {
    if (page > 1) {
      setPage((prev) => prev - 1);
    }
  }, [page]);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  return (
    <FormSection
      title="Activities"
      description="List of activities performed by the user."
      icon={Rocket}
    >
      {isLoading ? (
        <LoadingSection />
      ) : (
        <Card className="py-0" contentClassName="p-0">
          {data.map((activity, i) => {
            const { icon: Icon, class: iconClass } =
              ACTIVITY_ICON[activity.type] ?? {};
            return (
              <Fragment key={activity.id}>
                <div className="flex gap-4 items-center p-4">
                  {Icon && (
                    <div className={cn("p-2 rounded-lg", iconClass)}>
                      <Icon className="size-4" />
                    </div>
                  )}
                  <div className="flex flex-col flex-1 gap-y-1">
                    <div className="flex flex-1 justify-between">
                      <span className="font-semibold">{activity.title}</span>
                      <span className="text-muted-foreground text-xs">
                        {formatDateAgo(activity.created_at)}
                      </span>
                    </div>
                    {activity.description && (
                      <p className="text-muted-foreground text-xs">
                        {activity.description}
                      </p>
                    )}
                  </div>
                </div>
                {i < data.length - 1 && <Separator />}
              </Fragment>
            );
          })}
        </Card>
      )}

      <div className="flex gap-4 justify-end items-center">
        <Button
          variant="outline"
          size="sm"
          disabled={page === 1}
          onClick={onPrevious}
        >
          <ChevronLeft />
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={page === Math.ceil(totalCount / pageSize)}
          onClick={onNext}
        >
          Next
          <ChevronRight />
        </Button>
      </div>
    </FormSection>
  );
};

export default ActivitiesSection;
