import { create } from "zustand";

export interface WorkHour {
  id: number;
  created_at: string;
  user_id: string;
  hora_ingreso: string;
  hora_salida: string;
  horas_trabajadas: number;
}

interface WorkHoursStore {
  workHours: WorkHour[];
  setWorkHours: (workHours: WorkHour[]) => void;
  clearWorkHours: () => void;
}

export const useWorkHoursStore = create<WorkHoursStore>((set) => ({
  workHours: [],
  setWorkHours: (workHours) => set({ workHours }),
  clearWorkHours: () => set({ workHours: [] }),
}));
