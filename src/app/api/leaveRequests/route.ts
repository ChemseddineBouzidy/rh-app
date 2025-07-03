import { NextRequest, NextResponse } from 'next/server';
import { LeaveStatus } from '../../../../generated/prisma/client';
import { prisma } from '@/lib/db';

// Add this to prevent static optimization of this route
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const leaveRequests = await prisma.leaveRequest.findMany({
      include: {
        user: true,
        leave_type: true,
        validator: true,
      },
    });
    return NextResponse.json(leaveRequests);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    
    // Get user information including hire date
    const user = await prisma.user.findUnique({
      where: { id: data.user_id },
      select: { 
        id: true, 
        hire_date: true, 
        first_name: true, 
        last_name: true 
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' }, 
        { status: 404 }
      );
    }

    // Get leave type information
    const leaveType = await prisma.leave_types.findUnique({
      where: { id: data.leave_type_id },
      select: { name: true }
    });

    if (!leaveType) {
      return NextResponse.json(
        { error: 'Type de congé non trouvé' }, 
        { status: 404 }
      );
    }

    // Check if this is an annual leave request
    const isAnnualLeave = leaveType.name === 'Congé annuel payé';

    if (isAnnualLeave && user.hire_date) {
      const hireDate = new Date(user.hire_date);
      const currentDate = new Date();
      
      const monthsDiff = (currentDate.getFullYear() - hireDate.getFullYear()) * 12 + 
                        (currentDate.getMonth() - hireDate.getMonth());


      if (monthsDiff < 6) {
        return NextResponse.json({
          error: 'Accès refusé aux congés annuels',
          message: `Vous devez être employé depuis au moins 6 mois pour demander des congés annuels. Vous êtes employé depuis ${monthsDiff} mois.`,
          debug: {
            hireDate: hireDate.toISOString(),
            monthsEmployed: monthsDiff,
            minimumRequired: 6
          }
        }, { status: 403 });
      }

      // If exactly 6 months, check if total annual leave requests don't exceed 9 days
      if (monthsDiff === 6) {
        // Calculate requested days
        const startDate = new Date(data.startDate);
        const endDate = new Date(data.endDate);
        let businessDays = 0;
        const current = new Date(startDate);
        
        while (current <= endDate) {
          const dayOfWeek = current.getDay();
          if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Not weekend
            businessDays++;
          }
          current.setDate(current.getDate() + 1);
        }

        // Get existing annual leave requests for this year
        const currentYear = currentDate.getFullYear();
        const yearStart = new Date(currentYear, 0, 1);
        const yearEnd = new Date(currentYear, 11, 31);

        const existingAnnualLeaves = await prisma.leaveRequest.findMany({
          where: {
            user_id: data.user_id,
            leave_type: {
              name: 'Congé annuel payé'
            },
            startDate: {
              gte: yearStart,
              lte: yearEnd
            },
            status: {
              in: ['EN_ATTENTE', 'APPROUVE']
            }
          },
          include: {
            leave_type: true
          }
        });

        // Calculate total days already requested/approved
        let totalDaysUsed = 0;
        existingAnnualLeaves.forEach(leave => {
          const leaveStart = new Date(leave.startDate);
          const leaveEnd = new Date(leave.endDate);
          let leaveDays = 0;
          const current = new Date(leaveStart);
          
          while (current <= leaveEnd) {
            const dayOfWeek = current.getDay();
            if (dayOfWeek !== 0 && dayOfWeek !== 6) {
              leaveDays++;
            }
            current.setDate(current.getDate() + 1);
          }
          totalDaysUsed += leaveDays;
        });

        // Check if new request would exceed 9 days limit
        if (totalDaysUsed + businessDays > 9) {
          return NextResponse.json({
            error: 'Quota de congés annuels dépassé',
            message: `Pour les employés avec 6 mois d'ancienneté, le quota de congés annuels est limité à 9 jours. Vous avez déjà utilisé ${totalDaysUsed} jours et demandez ${businessDays} jours supplémentaires.`,
            debug: {
              monthsEmployed: monthsDiff,
              maxAllowed: 9,
              alreadyUsed: totalDaysUsed,
              requestedDays: businessDays,
              totalAfterRequest: totalDaysUsed + businessDays
            }
          }, { status: 403 });
        }
      }
    }

    // If all validations pass, create the leave request
    const leaveRequest = await prisma.leaveRequest.create({
      data: {
        user_id: data.user_id,
        leave_type_id: data.leave_type_id,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        status: data.status || LeaveStatus.EN_ATTENTE,
        reason: data.reason,
        validatedBy: data.validatedBy || null,
        decisionReason: data.decisionReason || null,
      },
      include: {
        user: true,
        leave_type: true,
        validator: true,
      }
    });

    return NextResponse.json(leaveRequest, { status: 201 });
  } catch (error) {
    console.error('Error creating leave request:', error);
    return NextResponse.json({ 
      error: 'Erreur lors de la création de la demande de congé',
      details: error.message 
    }, { status: 400 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const data = await req.json();
    const leaveRequest = await prisma.leaveRequest.update({
      where: { id: data.id },
      data: {
        user_id: data.user_id,
        leave_type_id: data.leave_type_id,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        status: data.status,
        reason: data.reason,
        validatedBy: data.validatedBy,
        decisionReason: data.decisionReason,
      },
    });
    return NextResponse.json(leaveRequest);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json();
    await prisma.leaveRequest.delete({ where: { id } });
    return NextResponse.json({ message: 'LeaveRequest deleted' });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function PATCH(req: NextRequest) {
  try { 
    const data = await req.json();
    const leaveRequest = await prisma.leaveRequest.update({
      where: { id: data.id },
      data: {
        status: data.status,
        validatedBy: data.validatedBy || null,
        decisionReason: data.decisionReason || null,
      },
    });
    return NextResponse.json(leaveRequest);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
