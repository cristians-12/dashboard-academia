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
    <div className="min-h-screen">
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-3">Mi Perfil</h1>
            <p className="text-gray-600 text-lg">
              Actualiza tu información personal y foto de perfil
            </p>
          </div>

          <div className="max-w-2xl mx-auto">
            <InfoForm />
          </div>
        </div>
      </main>
    </div>
  );
}
