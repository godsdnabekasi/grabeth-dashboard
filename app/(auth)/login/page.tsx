"use client";

import { useCallback, useEffect, useState } from "react";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { snapshot } from "valtio";

import { zodResolver } from "@hookform/resolvers/zod";

import { LoginSchema, loginSchema } from "@/components/page/login";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { supabaseClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { signOut } from "@/service/auth";
import { getUser } from "@/service/user";
import userStore from "@/store/user";

const LoginPage = () => {
  const router = useRouter();
  const { user } = snapshot(userStore);
  const [isLoading, setIsLoading] = useState(false);
  const isAuthenticated = user !== null;

  const { control, handleSubmit } = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = useCallback(
    async (data: LoginSchema) => {
      try {
        setIsLoading(true);
        const { data: session, error } =
          await supabaseClient.auth.signInWithPassword({
            email: data.email,
            password: data.password,
          });
        if (error) throw error;

        const { data: userData, error: userError } = await getUser(
          session.user.id
        );
        userStore.setUser(userData);
        if (userError) throw userError;

        if (userData.church_user?.role === "admin") {
          router.replace("/dashboard");
        } else {
          signOut();
          throw new Error("You are not authorized to access this page");
        }
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : "An unexpected error occurred"
        );
      } finally {
        setIsLoading(false);
      }
    },
    [router]
  );

  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/dashboard");
    }
  }, [isAuthenticated, router, user]);

  return (
    <main className="flex min-h-svh w-full flex-1 items-center justify-center p-6 md:p-10">
      <section className="w-full max-w-sm">
        <div className={cn("flex flex-col gap-6")}>
          <Card>
            <CardHeader>
              <CardTitle>Login to your account</CardTitle>
              <CardDescription>
                Enter your email below to login to your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
                <Input
                  id="email"
                  name="email"
                  control={control}
                  type="email"
                  placeholder="m@example.com"
                  required
                />
                <Input
                  id="password"
                  name="password"
                  control={control}
                  type="password"
                  required
                />
                <Field>
                  <Button loading={isLoading} type="submit">
                    Login
                  </Button>
                  <Separator />
                  <Button variant="outline" type="button">
                    Login with Google
                  </Button>
                </Field>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
};

export default LoginPage;
