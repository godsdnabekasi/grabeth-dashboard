import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface AlertProps {
  title: string;
  description: string;
  trigger: React.ReactNode;
  footer?: React.ReactNode;
}

const Alert = ({ title, description, trigger, footer }: AlertProps) => {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild key="trigger">
        {trigger}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter key="footer">{footer}</AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default Alert;
