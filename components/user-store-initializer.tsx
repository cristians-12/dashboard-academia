"use client";

import { useEffect } from "react";
import { useUserStore } from "@/store/user";
import { createClient } from "@/lib/supabase/client";

interface UserData {
  id: string;
  full_name: string;
  avatar_url: string;
  email: string;
}

interface Props {
  user: UserData;
}

export function UserStoreInitializer({ user }: Props) {
  const { setUser } = useUserStore();

  useEffect(() => {
    setUser(user);
  }, [user, setUser]);

  return null; // Este componente no renderiza nada
}

// Hook personalizado para cargar datos del usuario
export function useLoadUserData() {
  const { setUser, user } = useUserStore();

  useEffect(() => {
    const loadUserData = async () => {
      if (user) return; // Ya tenemos datos

      try {
        const supabase = createClient();
        const {
          data: { user: authUser },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError || !authUser) {
          return;
        }

        // Obtener datos del perfil
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name, avatar_url")
          .eq("id", authUser.id)
          .single();

        if (authUser) {
          setUser({
            id: authUser.id,
            full_name:
              profile?.full_name || authUser.user_metadata?.full_name || "",
            avatar_url:
              profile?.avatar_url || authUser.user_metadata?.avatar_url || "",
            email: authUser.email || "",
          });
        }
      } catch (error) {
        console.error("Error al cargar datos del usuario:", error);
      }
    };

    loadUserData();
  }, [setUser, user]);
}
