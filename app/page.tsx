import { redirect } from "next/navigation"

export default function Home() {
  redirect('/auth/login');
  return (
    <div>
      <h1>

      </h1>
    </div>
  )
}