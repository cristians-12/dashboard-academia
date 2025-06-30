import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { InfoIcon } from "lucide-react";
import { FetchDataSteps } from "@/components/tutorial/fetch-data-steps";
import InfoForm from "@/components/profile/info-form";
import SwitchHourButton from "@/components/switch-button";
import UserStoreLoader from "@/components/user-store-loader";
import WorkHoursContainer from "@/components/work-hours/work-hours-container";

export default async function ProtectedPage() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getUser();

  const uid = data.user && data.user.id;

  const { data: academiaData, error: academiaError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", uid);

  if (academiaError) {
    console.error("Error al obtener academia:", academiaError.message);
  }

  return (
    <div className="flex-1 w-full flex flex-col gap-12">
      <UserStoreLoader />
      <div className="w-full">
        <div className="bg-accent text-sm p-3 px-5 rounded-md text-foreground flex gap-3 items-center">
          <InfoIcon size="16" strokeWidth={2} />
          En esta página podrás registrar tus horas y ver cuántas llevas
          acumuladas en el mes.
        </div>
      </div>

      <div className="flex flex-col gap-2 items-start px-1">
        {academiaData && academiaData.length > 0 ? (
          <>
            <h2>Bienvenido, {academiaData[0]?.full_name || "Usuario"}</h2>
            <SwitchHourButton />
            <WorkHoursContainer />
          </>
        ) : (
          <>
            <p>Necesitamos tu informacion.</p>
            <InfoForm />
          </>
        )}
      </div>
    </div>
  );
}
