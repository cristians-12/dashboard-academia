import Link from "next/link";
import { AuthButton } from "../auth-button";
import { useUserStore } from "@/store/user";

interface Props {
  data: {
    full_name: string;
    avatar_url: string;
  };
}

// const { user } = useUserStore();

export default function ProfileNavbar({ data }: Props) {
  return (
    <header className="py-2 flex justify-between w-full items-center">
      <div className="flex items-center gap-10">
        <Link
          href={"/protected/profile"}
          className="flex items-center md:gap-5 gap-5"
        >
          <img
            className="w-16 rounded-full h-16 object-cover"
            src={data?.avatar_url}
            alt=""
          />
          <span>
            Hola, <span className="font-bold">{data?.full_name}</span>
          </span>
          {/* <h2>{JSON.stringify(data)}</h2> */}
        </Link>
        <Link className="font-bold" href={"/protected"}>
          Inicio
        </Link>
      </div>

      <AuthButton />
    </header>
  );
}
