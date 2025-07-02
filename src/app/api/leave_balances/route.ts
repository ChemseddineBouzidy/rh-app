import { getWorkingDays } from "@/lib/workingDays";
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "../../../../generated/prisma";


const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const leaveTypeId = searchParams.get('leaveTypeId');

    if (!userId || !leaveTypeId) {
      return NextResponse.json({ message: "userId et leaveTypeId requis" }, { status: 400 });
    }

    const balance = await prisma.leave_balances.findUnique({
      where: {
        user_id_leave_type_id: {
          user_id: userId,
          leave_type_id: parseInt(leaveTypeId),
        },
      },
      include: {
        user: {
          select: {
            first_name: true,
            last_name: true,
          },
        },
        leave_type: {
          select: {
            name: true,
            annual_quota: true,
          },
        },
      },
    });

    if (!balance) {
      return NextResponse.json({ message: "Solde de congé non trouvé" }, { status: 404 });
    }

    return NextResponse.json({ data: balance });
  } catch (error) {
    console.error("Erreur GET API:", error);
    return NextResponse.json({ message: "Erreur serveur", error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId, leaveTypeId, startDate, endDate } = await req.json();

    console.log("Données reçues:", { userId, leaveTypeId, startDate, endDate });
    console.log("Types:", typeof userId, typeof leaveTypeId, typeof startDate, typeof endDate);

    const start = new Date(startDate);
    const end = new Date(endDate);
    console.log("Dates parsées:", { start, end });
    
    const days = getWorkingDays(start, end);
    console.log("Jours calculés:", days);

    // nchofo wach leaveTypeId entier
    const leaveTypeIdInt = typeof leaveTypeId === 'number' ? leaveTypeId : parseInt(leaveTypeId);
    console.log("LeaveTypeId final:", leaveTypeIdInt);

    // nchofo wach userId kayn
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });
    console.log("Utilisateur trouvé:", user ? "Oui" : "Non");

    // nchofo wach leave_types kayn
    const leaveType = await prisma.leave_types.findUnique({
      where: { id: leaveTypeIdInt }
    });
    console.log("Type de congé trouvé:", leaveType);

    const balance = await prisma.leave_balances.findUnique({
      where: {
        user_id_leave_type_id: {
          user_id: userId,
          leave_type_id: leaveTypeIdInt,
        },
      },
    });

    console.log("Solde trouvé:", balance);

    if (!balance) {
      // verifie soldes utilisateur
      const allBalances = await prisma.leave_balances.findMany({
        where: { user_id: userId },
        include: { leave_type: true }
      });
      console.log("Tous les soldes pour cet utilisateur:", allBalances);
      
      return NextResponse.json({ 
        message: `Solde de congé non trouvé pour le type ${leaveTypeIdInt}. Types disponibles: ${allBalances.map(b => `${b.leave_type_id} (${b.leave_type.name})`).join(', ')}`,
        debug: {
          userId,
          leaveTypeIdRequested: leaveTypeIdInt,
          userExists: !!user,
          leaveTypeExists: !!leaveType,
          availableLeaveTypes: allBalances.map(b => ({
            id: b.leave_type_id,
            name: b.leave_type.name,
            balance: b.balance
          }))
        }
      }, { status: 404 });
    }

    if (balance.balance < days) {
      return NextResponse.json({ 
        message: "Solde insuffisant",
        debug: {
          soldeActuel: balance.balance,
          joursdemandes: days
        }
      }, { status: 400 });
    }

    const updated = await prisma.leave_balances.update({
      where: {
        user_id_leave_type_id: {
          user_id: userId,
          leave_type_id: leaveTypeIdInt,
        },
      },
      data: {
        balance: {
          decrement: days,
        },
      },
    });

    return NextResponse.json({ 
      message: "Solde mis à jour", 
      data: {
        ...updated,
        joursUtilises: days,
        ancienSolde: balance.balance,
        nouveauSolde: updated.balance
      }
    });
  } catch (error) {
    console.error("Erreur POST API:", error);
    return NextResponse.json({ message: "Erreur serveur", error: error.message }, { status: 500 });
  }
}

