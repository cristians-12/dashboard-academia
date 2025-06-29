"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function InfoForm() {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<
    "idle" | "success" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [fullName, setFullName] = useState<string>("");

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
      return publicUrl;
    } catch (error) {
      console.error("Error al subir la imagen:", error);
      throw error;
    }
  };

  // Actualiza o crea el perfil con nombre y avatar_url
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
      <form onSubmit={handleSubmit} className="w-full space-y-4">
        {/* Área de subida de foto */}
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            {previewUrl ? (
              <img
                src={previewUrl}
                alt="Vista previa"
                className="w-32 h-32 rounded-full object-cover border-2 border-gray-300"
              />
            ) : (
              <div className="w-32 h-32 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center">
                <span className="text-gray-500 text-sm">Sin foto</span>
              </div>
            )}

            {/* Indicador de carga */}
            {isUploading && (
              <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
              </div>
            )}
          </div>

          <label className="cursor-pointer bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
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
          <div className="text-red-500 text-sm text-center">{errorMessage}</div>
        )}

        {uploadStatus === "success" && (
          <div className="text-green-500 text-sm text-center">
            ¡Perfil guardado exitosamente!
          </div>
        )}

        {/* Campo de nombre */}
        <div className="w-full">
          <input
            type="text"
            placeholder="Ingresa tu nombre"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="px-3 py-2 w-full rounded-md border focus:outline-none"
            disabled={isUploading}
          />
        </div>

        {/* Botón de guardar */}
        <button
          type="submit"
          disabled={isUploading || (!selectedImage && !fullName)}
          className="w-full bg-gray-600 text-white px-4 py-2 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700"
        >
          {isUploading ? "Guardando..." : "Guardar"}
        </button>
      </form>
    </div>
  );
}
