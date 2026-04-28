"use client";

import * as React from "react";

import { BotIcon, Church, Users } from "lucide-react";
import { useSnapshot } from "valtio";

import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import { TeamSwitcher } from "@/components/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import userStore from "@/store/user";

const data = {
  navMain: [
    {
      title: "Account Management",
      url: "#",
      icon: <Users />,
      isActive: true,
      items: [
        {
          title: "Account",
          url: "/account",
        },
        {
          title: "Roles",
          url: "#",
        },
        {
          title: "Permissions",
          url: "#",
        },
      ],
    },
    {
      title: "Programs",
      url: "#",
      icon: <BotIcon />,
      items: [
        {
          title: "Event",
          url: "/event",
        },
        {
          title: "Services",
          url: "#",
        },
      ],
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useSnapshot(userStore);

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher
          teams={[
            {
              name: user?.church_user?.church?.name || "",
              logo: <Church />,
              plan: user?.church_user?.role || "",
            },
          ]}
        />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        {/* <NavProjects projects={data.projects} /> */}
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
