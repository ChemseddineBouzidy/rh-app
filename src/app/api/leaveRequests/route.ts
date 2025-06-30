import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient, LeaveStatus } from '../../../../generated/prisma/client';

const prisma = new PrismaClient();

// GET all leave requests
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
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST create a new leave request
export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
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
    });
    return NextResponse.json(leaveRequest, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

// PUT update a leave request
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

// DELETE a leave request
export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json();
    await prisma.leaveRequest.delete({ where: { id } });
    return NextResponse.json({ message: 'LeaveRequest deleted' });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

// PATCH update the status of a leave request
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
