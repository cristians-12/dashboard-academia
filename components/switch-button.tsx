"use client";

import { createClient } from "@/lib/supabase/client";
import { useUserStore } from "@/store/user";
import { useState } from "react";

export default function SwitchHourButton() {
  const [isEntrada, setIsEntrada] = useState(true);
  const [horaIngreso, setHoraIngreso] = useState<string | null>(null);
  const [horaSalida, setHoraSalida] = useState<string | null>(null);
  const [status, setStatus] = useState<string>("");

  const { user } = useUserStore();

  async function handleClick() {
    const now = new Date();
    const supabase = createClient();
    const hora = now.toTimeString().slice(0, 5);
    const fecha = now.toISOString().slice(0, 10);
    if (isEntrada) {
      setHoraIngreso(hora);
      setIsEntrada(false);
    } else {
      setHoraSalida(hora);
      setIsEntrada(true);

      // Calcular horas trabajadas y guardar en BD
      const [h1, m1] = horaIngreso!.split(":").map(Number);
      const [h2, m2] = hora.split(":").map(Number);
      const horasTrabajadasRaw = h2 + m2 / 60 - (h1 + m1 / 60);
      // Truncar a dos decimales
      const horasTrabajadas = Math.trunc(horasTrabajadasRaw * 100) / 100;

      // Aquí haces el insert a la base (ejemplo con fetch)
      const { error } = await supabase.from("horas_trabajo").insert([
        {
          user_id: user?.id,
          created_at: fecha,
          hora_ingreso: horaIngreso,
          hora_salida: hora,
          horas_trabajadas: horasTrabajadas,
        },
      ]);
      if (error) {
        setStatus("Error: " + error.message);
      } else {
        setStatus("Registro guardado correctamente ✅");
      }

      // Reiniciar datos
      setHoraIngreso(null);
      setHoraSalida(null);
    }
  }

  return (
    <>
      <div
        style={{
          backgroundColor: isEntrada ? "green" : "red",
        }}
        onClick={handleClick}
        className="text-white w-fit mx-auto px-10 py-3 rounded-xl font-bold cursor-pointer"
      >
        {isEntrada ? "Marcar ingreso" : "Marcar salida"}
      </div>
      <div className="mt-4 text-center">
        {horaIngreso && <div>Hora ingreso: {horaIngreso}</div>}
        {horaSalida && <div>Hora salida: {horaSalida}</div>}
      </div>
    </>
  );
}
