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
    <header className="py-2 flex justify-between w-full">
      <Link href={"/protected/profile"} className="flex items-center md:gap-10 gap-5">
        <img
          className="w-16 rounded-full h-16 object-cover"
          src={data?.avatar_url}
          alt=""
        />
        <span>Hola, {data?.full_name}</span>
        {/* <h2>{JSON.stringify(data)}</h2> */}
      </Link>

      <AuthButton />
    </header>
  );
}
