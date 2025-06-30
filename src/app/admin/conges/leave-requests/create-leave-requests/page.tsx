// page.tsx (Server Component)
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import CreateLeaveRequestClient from "@/components/CreateLeaveRequestClient";


interface CustomSession {
  user: {
    id?: string;
    first_name?: string;
    last_name?: string;
    email?: string | null;
    image?: string | null;
    role?: string;
  }
}

export default async function CreateLeaveRequestPage() {
  const session = await getServerSession(authOptions as any);
  const customSession = session as CustomSession;
  
  if (!session || customSession.user.role !== "admin") {
    redirect("/auth/signin");
  }

  return (
    <CreateLeaveRequestClient 
      adminId={customSession.user.id || null}
      userInfo={customSession.user}
    />
  );
}