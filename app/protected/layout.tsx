import { DeployButton } from "@/components/deploy-button";
import { EnvVarWarning } from "@/components/env-var-warning";
import { AuthButton } from "@/components/auth-button";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { hasEnvVars } from "@/lib/utils";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ProfileNavbar from "@/components/profile/navbar-profile";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) {
    redirect("/auth/login");
  }

  const uid = data.user.id;

  const { data: profileData, error: academiaError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", uid);

  if (academiaError) {
    console.error("Error al obtener academia:", academiaError.message);
  }
  return (
    <main className="min-h-screen flex flex-col items-center">
      <div className="flex-1 w-full flex flex-col gap-20 items-center">
        <nav className="w-full flex justify-between border-b border-b-foreground/10">
          <div className="w-full flex justify-between items-center px-5 text-sm">
            {/* {!hasEnvVars ? <EnvVarWarning /> : <AuthButton />} */}
            {profileData && profileData?.length > 0 ? (
              <ProfileNavbar data={profileData && profileData[0]} />
            ) : null}
          </div>
        </nav>
        <div className="flex flex-col w-full">{children}</div>
      </div>
    </main>
  );
}
