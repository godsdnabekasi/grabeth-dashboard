"use client";

import { useParams } from "next/navigation";

import CoolForm from "@/app/(main)/cool/_components/form";
import {
  useCoolDetail,
  useDeleteCool,
  useUpdateCool,
} from "@/app/(main)/cool/_hooks/useCoolDetail";
import LoadingSection from "@/components/ui/loading-section";
import PageHeader from "@/components/ui/page-header";

const CoolDetailPage = () => {
  const { id } = useParams();
  const coolId = Number(id);

  const { data, isLoading } = useCoolDetail(coolId);

  const item = data?.item;

  const updateMutation = useUpdateCool(coolId, item);
  const deleteMutation = useDeleteCool(coolId, item);

  const isSubmitting = updateMutation.isPending || deleteMutation.isPending;

  return (
    <>
      <PageHeader title="COOL Details" />
      {isLoading ? (
        <LoadingSection />
      ) : (
        <CoolForm
          mode="edit"
          initialValues={item}
          isSubmitting={isSubmitting}
          submitLabel="Update"
          onSubmit={updateMutation.mutate}
          onDelete={deleteMutation.mutate}
        />
      )}
    </>
  );
};

export default CoolDetailPage;
