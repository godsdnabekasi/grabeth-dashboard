import { ReactNode } from "react";

const PageSection = ({ children }: { children: ReactNode }) => {
  return (
    <section className="flex flex-col flex-1 space-y-6 px-4 pb-6 bg-gray-100">
      {children}
    </section>
  );
};

export default PageSection;
