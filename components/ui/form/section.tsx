import React from "react";

import { LucideIcon } from "lucide-react";

interface IFormSectionProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  action?: React.ReactNode;
  children?: React.ReactNode;
}

const FormSection = ({
  title,
  description,
  icon,
  action,
  children,
}: IFormSectionProps) => {
  return (
    <section className="space-y-6">
      <div className="flex flex-row items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            {icon && (
              <div className="p-2 bg-pink-100 rounded-lg">
                {React.createElement(icon, {
                  className: "w-5 h-5 text-rose-500",
                })}
              </div>
            )}
            <h3 className="text-xl font-bold text-foreground/80">{title}</h3>
          </div>
          {description && (
            <p className="text-muted-foreground text-sm">{description}</p>
          )}
        </div>
        <div className="flex">{action}</div>
      </div>

      {children}
    </section>
  );
};

export default FormSection;
