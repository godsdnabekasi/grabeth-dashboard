import { Trash2 } from "lucide-react";

import { Card } from "../../ui/card";
import Alert from "@/components/ui/alert";
import { AlertDialogCancel } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

interface IDeleteSectionProps {
  title: string;
  description: string;
  triggerButtonText: string;
  alertTitle: string;
  alertDescription: string;
  onDelete: () => void;
}

const DeleteSection = ({
  onDelete,
  title,
  description,
  alertDescription,
  alertTitle,
  triggerButtonText,
}: IDeleteSectionProps) => {
  return (
    <Card
      title={
        <span className="flex items-center gap-2 text-red-500">
          <Trash2 className="size-4" />
          <h1 className="text-base font-semibold">{title}</h1>
        </span>
      }
      description={<p className="text-muted-foreground">{description}</p>}
      className="border border-red-200 bg-red-50"
      action={
        <Alert
          title={alertTitle}
          description={alertDescription}
          trigger={
            <Button variant="destructiveOutline">{triggerButtonText}</Button>
          }
          footer={
            <div className="flex justify-between gap-4">
              <AlertDialogCancel asChild>
                <Button variant="outline">Cancel</Button>
              </AlertDialogCancel>

              <Button variant="destructive" onClick={onDelete}>
                Delete
              </Button>
            </div>
          }
        />
      }
    ></Card>
  );
};

export default DeleteSection;
