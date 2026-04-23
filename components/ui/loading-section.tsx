import { Spinner } from "@/components/ui/spinner";

const LoadingSection = () => {
  return (
    <div className="flex flex-1 flex-col justify-center items-center">
      <Spinner />
    </div>
  );
};

export default LoadingSection;
