"use client";

import { useEffect, useState } from "react";

import { toast } from "sonner";

import { User } from "@supabase/supabase-js";

import { getUser } from "@/service/user";
import userStore from "@/store/user";

export default function UserProvider({
  initialUser,
  children,
}: {
  initialUser: User | null;
  children: React.ReactNode;
}) {
  const { setUser } = userStore;
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!initialUser) return;

    const loadUser = async () => {
      try {
        setIsLoading(true);

        const { data, error } = await getUser(initialUser.id);
        if (error) throw error;

        setUser(data);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : String(error));
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, [initialUser, setUser]);

  return isLoading ? null : children;
}
