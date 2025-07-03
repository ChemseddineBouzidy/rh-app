import { NextRequest, NextResponse } from "next/server";
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

    console.log("Fetching leave balances for user ID:", userId);

    // Vérifier que l'utilisateur existe
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        first_name: true,
        last_name: true,
        email: true,
        role: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Utilisateur non trouvé" },
        { status: 404 }
      );
    }

    const balances = await prisma.leave_balances.findMany({
      where: {
        user_id: userId,
      },
      include: {
        leave_type: {
          select: {
            id: true,
            name: true,
            description: true,
            annual_quota: true,
          },
        },
      },
      orderBy: {
        leave_type: {
          name: 'asc',
        },
      },
    });

    const balancesWithStats = balances.map(balance => {
      const usedDays = balance.leave_type.annual_quota - balance.balance;
      const usagePercentage = (usedDays / balance.leave_type.annual_quota) * 100;
      const remainingPercentage = (balance.balance / balance.leave_type.annual_quota) * 100;
      
      return {
        id: balance.id,
        balance: balance.balance,
        leave_type: balance.leave_type,
        used_days: usedDays,
        total_quota: balance.leave_type.annual_quota,
        usage_percentage: Math.round(usagePercentage * 100) / 100,
        remaining_percentage: Math.round(remainingPercentage * 100) / 100,
        is_low_balance: balance.balance <= balance.leave_type.annual_quota * 0.2,
        is_critical_balance: balance.balance <= balance.leave_type.annual_quota * 0.1,
        status: balance.balance <= 0 ? 'épuisé' : 
                balance.balance <= balance.leave_type.annual_quota * 0.1 ? 'critique' :
                balance.balance <= balance.leave_type.annual_quota * 0.2 ? 'faible' : 'normal',
      };
    });

    const totalQuota = balances.reduce((sum, b) => sum + b.leave_type.annual_quota, 0);
    const totalUsed = balances.reduce((sum, b) => sum + (b.leave_type.annual_quota - b.balance), 0);
    const totalRemaining = balances.reduce((sum, b) => sum + b.balance, 0);

    const response = {
      user,
      balances: balancesWithStats,
      summary: {
        total_leave_types: balances.length,
        total_quota: totalQuota,
        total_used: totalUsed,
        total_remaining: totalRemaining,
        overall_usage_percentage: totalQuota > 0 ? Math.round((totalUsed / totalQuota) * 10000) / 100 : 0,
        low_balance_types: balancesWithStats.filter(b => b.is_low_balance).length,
        critical_balance_types: balancesWithStats.filter(b => b.is_critical_balance).length,
      },
    };

    console.log("Found leave balances:", balances.length);
    return NextResponse.json(response);
    
  } catch (error: any) {
    console.error("Detailed error fetching user leave balances:", {
      error: error.message,
      stack: error.stack,
      userId: params?.id,
    });
    return NextResponse.json(
      { 
        error: "Erreur lors de la récupération des soldes de congés", 
        details: error.message 
      },
      { status: 500 }
    );
  }
}
