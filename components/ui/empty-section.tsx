interface IEmptySectionProps {
  message: string;
  icon?: React.ComponentType<React.ComponentProps<"svg">>;
  className?: string;
}

const EmptySection = ({
  message,
  icon: Icon,
  className,
}: IEmptySectionProps) => {
  return (
    <div className={`flex items-center justify-center min-h-24 ${className}`}>
      <span className="flex items-center gap-2">
        {Icon && <Icon className="size-4 text-muted-foreground" />}
        <p className="text-sm text-muted-foreground">{message}</p>
      </span>
    </div>
  );
};

export default EmptySection;
