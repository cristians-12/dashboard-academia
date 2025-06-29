import { AuthButton } from "../auth-button";

interface Props {
  data: {
    full_name: string;
    avatar_url: string;
  };
}

export default function ProfileNavbar({ data }: Props) {
  return (
    <header className="py-5 flex justify-between w-full">
      <figure className="flex items-center gap-10">
        <img className="w-16 rounded-full" src={data?.avatar_url} alt="" />
        <span>Hola, {data?.full_name}</span>
        {/* <h2>{JSON.stringify(data)}</h2> */}
      </figure>

      <AuthButton />
    </header>
  );
}
