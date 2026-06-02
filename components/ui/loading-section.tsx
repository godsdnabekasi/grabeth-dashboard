import { Spinner } from "@/components/ui/spinner";

const LoadingSection = () => {
  return (
    <div className="flex flex-1 flex-col justify-center items-center min-h-24">
      <Spinner />
    </div>
  );
};

export default LoadingSection;
