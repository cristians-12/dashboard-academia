"use client";
import { useWorkHoursStore } from "@/store/work_hours";

export default function WorkHoursContainer() {
  const { workHours } = useWorkHoursStore();

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border border-gray-300 rounded-lg">
        <thead>
          <tr className="bg-gray-500">
            <th className="px-4 py-2 border">Fecha</th>
            <th className="px-4 py-2 border">Hora ingreso</th>
            <th className="px-4 py-2 border">Hora salida</th>
            <th className="px-4 py-2 border">Horas trabajadas</th>
          </tr>
        </thead>
        <tbody>
          {workHours.map((element) => (
            <tr key={element.id} className="text-center">
              <td className="px-4 py-2 border">
                {new Date(element.created_at).toLocaleString("es-ES", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </td>
              <td className="px-4 py-2 border">
                {new Date(
                  `1970-01-01T${element.hora_ingreso}`
                ).toLocaleTimeString("es-ES", {
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: true,
                })}
              </td>
              <td className="px-4 py-2 border">
                {new Date(
                  `1970-01-01T${element.hora_salida}`
                ).toLocaleTimeString("es-ES", {
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: true,
                })}
              </td>
              <td className="px-4 py-2 border">{element.horas_trabajadas}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
