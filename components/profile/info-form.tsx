"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useUserStore } from "@/store/user";

interface InitialData {
  full_name: string;
  avatar_url: string;
}

interface Props {
  initialData?: InitialData;
}

export default function InfoForm({ initialData }: Props) {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<
    "idle" | "success" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [fullName, setFullName] = useState<string>("");

  const { setUser, user } = useUserStore();

  useEffect(() => {
    if (initialData) {
      setFullName(initialData.full_name || "");
      setPreviewUrl(initialData.avatar_url || null);
    } else {
      loadCurrentUserData();
    }
  }, [initialData]);

  const loadCurrentUserData = async () => {
    try {
      const supabase = createClient();
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, avatar_url")
        .eq("id", user.id)
        .single();

      if (profile) {
        setFullName(profile.full_name || "");
        setPreviewUrl(profile.avatar_url || null);
        setUser({
          avatar_url: profile.avatar_url,
          full_name: profile.full_name,
          email: user?.email ?? "",
          id: user.id,
        });
      }
    } catch (error) {
      console.error("Error al cargar datos del usuario:", error);
    }
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrorMessage("La imagen debe ser menor a 5MB");
        return;
      }

      // Validar el tipo de archivo
      if (!file.type.startsWith("image/")) {
        setErrorMessage("Por favor selecciona un archivo de imagen válido");
        return;
      }

      setSelectedImage(file);
      setErrorMessage("");
      setUploadStatus("idle");
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const uploadImageToSupabase = async (
    file: File,
    userId: string
  ): Promise<string | null> => {
    const supabase = createClient();
    const fileExt = file.name.split(".").pop();
    const fileName = `profile-${userId}.${fileExt}`;
    const filePath = `profiles/${fileName}`;
    try {
      const { data: existingFiles } = await supabase.storage
        .from("testcristians12")
        .list("profiles", {
          search: `profile-${userId}.`,
        });
      if (existingFiles && existingFiles.length > 0) {
        for (const existingFile of existingFiles) {
          await supabase.storage
            .from("testcristians12")
            .remove([`profiles/${existingFile.name}`]);
        }
      }
      const { data, error } = await supabase.storage
        .from("testcristians12")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });
      if (error) {
        console.error("Error de Supabase:", error);
        if (error.message.includes("row-level security policy")) {
          throw new Error(
            "Error de permisos. Verifica las políticas de seguridad del bucket."
          );
        }
        throw error;
      }
      const {
        data: { publicUrl },
      } = supabase.storage.from("testcristians12").getPublicUrl(filePath);
      return publicUrl + `?t=${Date.now()}`;
    } catch (error) {
      console.error("Error al subir la imagen:", error);
      throw error;
    }
  };

  const updateUserProfile = async (
    userId: string,
    imageUrl: string | null,
    name: string
  ) => {
    const supabase = createClient();
    const updateData: any = { updated_at: new Date().toISOString() };
    if (imageUrl) updateData.avatar_url = imageUrl;
    if (name) updateData.full_name = name;
    try {
      const { error: updateError } = await supabase.from("profiles").upsert(
        {
          id: userId,
          ...updateData,
        },
        { onConflict: "id" }
      );
      if (updateError) {
        console.error("Error al actualizar/crear perfil:", updateError);
      }
    } catch (error) {
      console.error("Error al guardar perfil:", error);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsUploading(true);
    setUploadStatus("idle");
    setErrorMessage("");
    try {
      const supabase = createClient();
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();
      if (authError || !user) {
        setErrorMessage("Debes estar autenticado para guardar tu perfil");
        setIsUploading(false);
        return;
      }
      let imageUrl = previewUrl;
      if (selectedImage) {
        imageUrl = await uploadImageToSupabase(selectedImage, user.id);
      }
      await updateUserProfile(user.id, imageUrl, fullName);
      setUploadStatus("success");
      setTimeout(() => {
        setSelectedImage(null);
        setPreviewUrl(imageUrl || null);
        setUploadStatus("idle");
      }, 2000);
    } catch (error) {
      setUploadStatus("error");
      setErrorMessage("Error al guardar el perfil. Intenta de nuevo.");
      console.error("Error:", error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex flex-col justify-center items-center w-full max-w-md mx-auto p-6">
      <form onSubmit={handleSubmit} className="w-full space-y-6">
        {/* Área de subida de foto */}
        <div className="flex flex-col items-center space-y-4">
          <div className="relative group">
            {previewUrl ? (
              <img
                src={previewUrl}
                alt="Vista previa"
                className="w-32 h-32 rounded-full object-cover border-4 border-gray-200 shadow-lg group-hover:border-blue-300 transition-colors"
              />
            ) : (
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 border-4 border-dashed border-gray-300 flex items-center justify-center group-hover:border-blue-300 transition-colors">
                <span className="text-gray-500 text-sm font-medium">
                  Sin foto
                </span>
              </div>
            )}

            {/* Indicador de carga */}
            {isUploading && (
              <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
              </div>
            )}
          </div>

          <label className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-md hover:shadow-lg">
            <span>{isUploading ? "Subiendo..." : "Seleccionar foto"}</span>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
              disabled={isUploading}
            />
          </label>
        </div>

        {/* Mensajes de estado */}
        {errorMessage && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm text-center">
            {errorMessage}
          </div>
        )}

        {uploadStatus === "success" && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm text-center">
            ¡Perfil guardado exitosamente!
          </div>
        )}

        {/* Campo de nombre */}
        <div className="w-full">
          <label
            htmlFor="fullName"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Nombre completo
          </label>
          <input
            id="fullName"
            type="text"
            placeholder="Ingresa tu nombre completo"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="px-4 py-3 w-full rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
            disabled={isUploading}
          />
        </div>

        {/* Botón de guardar */}
        <button
          type="submit"
          disabled={isUploading || (!selectedImage && !fullName)}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-md hover:shadow-lg"
        >
          {isUploading ? "Guardando..." : "Guardar cambios"}
        </button>
      </form>
    </div>
  );
}
