import { Trash2 } from "lucide-react";

import { Card } from "../../../../components/ui/card";
import Alert from "@/components/ui/alert";
import { AlertDialogCancel } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

interface IDeleteSectionProps {
  onDelete: () => void;
}

const DeleteSection = ({ onDelete }: IDeleteSectionProps) => {
  return (
    <Card
      title={
        <span className="flex items-center gap-2 text-red-500">
          <Trash2 className="size-4" />
          <h1 className="text-base font-semibold">Delete Church</h1>
        </span>
      }
      description={
        <p className="text-muted-foreground">
          Once you delete a church, there is no going back. All data associated
          with this church will be permanently removed. Please be certain.
        </p>
      }
      className="border border-red-200 bg-red-50"
      action={
        <Alert
          title="Delete Church"
          description="Please make sure you want to delete this Church. Once you delete this, there is no going back"
          trigger={<Button variant="destructiveOutline">Delete Church</Button>}
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
