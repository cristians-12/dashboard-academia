"use client";

import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import UserIcon from "@/assets/icons/user-icon";

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [identificacion, setIdentificacion] = useState<number | undefined>(
    undefined
  );
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    try {
      const email = `${identificacion}@mail.com`;
      const password = "Secret123**_!"; // 👈 define una contraseña fija o generada al registrar

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // ✅ Aquí tienes el JWT
      console.log("JWT:", data.session?.access_token);

      router.push("/protected");
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Ocurrió un error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="bg-blue-950 flex flex-col justify-center items-center">
        <figure className="bg-gray-100 py-4 px-4 mt-5 rounded-full">
          <UserIcon />
        </figure>
        <CardHeader>
          <CardTitle className="text-2xl text-white text-center">
            Identifícate
          </CardTitle>
          <CardDescription className="text-white">
            Ingresa tu número de identificación.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="identificacion">Número de identificación</Label>
                <Input
                  id="identificacion"
                  type="number"
                  placeholder="1000000000"
                  required
                  value={identificacion}
                  onChange={(e) => setIdentificacion(Number(e.target.value))}
                />
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Iniciando..." : "Iniciar"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
