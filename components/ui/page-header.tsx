import { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  action?: ReactNode;
}

const PageHeader = ({ title, action }: PageHeaderProps) => {
  return (
    <div className="flex justify-between items-center">
      <h1 className="text-4xl font-bold">{title}</h1>
      {action}
    </div>
  );
};

export default PageHeader;
