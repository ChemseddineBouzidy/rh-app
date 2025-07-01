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
  
  // Enhanced role validation - allow admin, rh, and manager roles
  const allowedRoles = ['admin', 'rh', 'manager'];
  const userRole = customSession?.user?.role;
  
  if (!session || !userRole || !allowedRoles.includes(userRole)) {
    redirect("/auth/signin");
  }

  // Ensure we have required user data
  if (!customSession.user.id) {
    redirect("/auth/signin");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Enhanced background pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      
      <div className="relative z-10">
        <CreateLeaveRequestClient 
          adminId={customSession.user.id}
          userInfo={{
            ...customSession.user,
            fullName: `${customSession.user.first_name || ''} ${customSession.user.last_name || ''}`.trim() || 'Utilisateur'
          }}
        />
      </div>
    </div>
  );
}