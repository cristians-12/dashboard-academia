import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import InfoForm from "@/components/profile/info-form";
import ProfileNavbar from "@/components/profile/navbar-profile";

export default async function ProfilePage() {
  const supabase = await createClient();

  // Obtener el usuario actual
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/auth/login");
  }

  // Obtener los datos del perfil
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("full_name, avatar_url")
    .eq("id", user.id)
    .single();

  if (profileError && profileError.code !== "PGRST116") {
    console.error("Error al cargar perfil:", profileError);
  }

  const userData = {
    full_name: profile?.full_name || user.user_metadata?.full_name || "",
    avatar_url: profile?.avatar_url || user.user_metadata?.avatar_url || "",
  };

  return (
    <div className="min-h-screen md:px-20 px-10">
      <h1 className="text-4xl font-bold mb-3">Mi Perfil</h1>
      <main className="px-4 py-8 md:flex gap-20">
        <div className="shadow-lg md:border-e-2 p-5">
          <div className="text-center mb-8">
            <p className="text-gray-600 text-lg">
              Actualiza tu información personal y foto de perfil
            </p>
          </div>

          <div className="">
            <InfoForm />
          </div>
        </div>
        <div>
          <h2 className="text-2xl">Mis grupos</h2>
        </div>
      </main>
    </div>
  );
}
