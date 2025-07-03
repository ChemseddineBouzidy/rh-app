import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/db";

// Add this to prevent static optimization of this route
export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = params.id;
    
    if (!userId) {
      return NextResponse.json(
        { error: "ID utilisateur requis" },
        { status: 400 }
      );
    }

    console.log("Fetching leave requests for user ID:", userId);


    const leaveRequests = await prisma.leaveRequest.findMany({
      where: {
        user_id: userId,
      },
      include: {
        user: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            photo: true,
          },
        },
        leave_type: true,
        validator: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    console.log("Found leave requests:", leaveRequests.length);

    return NextResponse.json(leaveRequests);
  } catch (error: any) {
    console.error("Detailed error fetching user leave requests:", {
      error: error.message,
      stack: error.stack,
      userId: params?.id,
    });
    return NextResponse.json(
      { error: "Erreur lors de la récupération des demandes de congés", details: error.message },
      { status: 500 }
    );
  }
}

