import { AppSidebar } from "@/components/app-sidebar";
import PageSection from "@/components/ui/page-section";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import UserProvider from "@/components/user-provider";
import { createClient } from "@/lib/supabase/server";

const MainLayout = async ({ children }: { children: React.ReactNode }) => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <UserProvider initialUser={user}>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <PageSection>{children}</PageSection>
        </SidebarInset>
      </SidebarProvider>
    </UserProvider>
  );
};

export default MainLayout;
