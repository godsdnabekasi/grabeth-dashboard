import { Trash2 } from "lucide-react";

import { Card } from "../../ui/card";
import Alert from "@/components/ui/alert";
import { AlertDialogCancel } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

interface IDeleteSectionProps {
  onDelete: () => void;
}

const DeleteSection = ({ onDelete }: IDeleteSectionProps) => {
  return (
    <Card className="p-4 border border-red-200 bg-red-50 flex-row gap-8 justify-between items-center">
      <div className="space-y-1">
        <span className="flex items-center gap-2 text-red-500">
          <Trash2 className="size-4" />
          <h1 className="text-base font-semibold">Delete COOL</h1>
        </span>
        <p className="text-muted-foreground">
          Once you delete a group, there is no going back. All data associated
          with this group will be permanently removed. Please be certain.
        </p>
      </div>

      <Alert
        title="Delete COOL"
        description="Please make sure you want to delete this COOL. Once you delete this, there is no going back"
        trigger={<Button variant="destructiveOutline">Delete COOL</Button>}
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
    </Card>
  );
};

export default DeleteSection;
