import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";

export default async function AdminPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "admin") {
    redirect("/auth/signin");
  }
console.log("Session:", session);
  return (
    <div>
      Bienvenue, {session.user.first_name ?? session.user.email} (admin)
    </div>
  );
}
