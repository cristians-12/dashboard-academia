"use client";

import { createClient } from "@/lib/supabase/client";
import { useUserStore } from "@/store/user";
import { useWorkHoursStore } from "@/store/work_hours";
import { useEffect, useState } from "react";

export default function SwitchHourButton() {
  const [isEntrada, setIsEntrada] = useState(true);
  const [horaIngreso, setHoraIngreso] = useState<string | null>(null);
  const [horaSalida, setHoraSalida] = useState<string | null>(null);
  const [status, setStatus] = useState<string>("");

  const { user } = useUserStore();
  const { workHours } = useWorkHoursStore();

  useEffect(() => {
    const ultimoRegistro = workHours[workHours.length - 1];
    console.log("ultimo", ultimoRegistro);
    if (ultimoRegistro && ultimoRegistro.hora_salida === null) {
      setIsEntrada(false);
    }
  }, [workHours]);

  async function handleClick() {
    const now = new Date();
    const supabase = createClient();
    const hora = now.toTimeString().slice(0, 5);
    const fecha = now.toISOString().slice(0, 10);

    if (isEntrada) {
      setHoraIngreso(hora);
      setIsEntrada(false);
      const { error } = await supabase.from("horas_trabajo").insert([
        {
          user_id: user?.id,
          created_at: fecha,
          hora_ingreso: hora,
        },
      ]);
      if (error) {
        setStatus("Error: " + error.message);
      } else {
        setStatus("Registro guardado correctamente ✅");
      }
    } else {
      setHoraSalida(hora);
      setIsEntrada(true);

      // Buscar el último registro sin hora_salida
      const ultimoRegistro = workHours.find(
        (registro) => registro.hora_salida === null
      );

      if (!ultimoRegistro) {
        setStatus("No se encontró un registro de entrada sin salida.");
        return;
      }

      // Calcular horas trabajadas y guardar en BD
      const [h1, m1] = ultimoRegistro.hora_ingreso.split(":").map(Number);
      const [h2, m2] = hora.split(":").map(Number);
      const horasTrabajadasRaw = h2 + m2 / 60 - (h1 + m1 / 60);
      const horasTrabajadas = Math.trunc(horasTrabajadasRaw * 100) / 100;

      // Hacer el update SOLO del último registro
      const { error } = await supabase
        .from("horas_trabajo")
        .update({
          hora_salida: hora,
          horas_trabajadas: horasTrabajadas,
        })
        .eq("id", ultimoRegistro.id);

      if (error) {
        setStatus("Error: " + error.message);
      } else {
        setStatus("Registro actualizado correctamente ✅");
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
