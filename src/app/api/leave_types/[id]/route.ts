import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from "../../../../../generated/prisma";

const prisma = new PrismaClient();


export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);

    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'ID invalide' },
        { status: 400 }
      );
    }

    const leaveType = await prisma.leave_types.findUnique({
      where: { id }
    });

    if (!leaveType) {
      return NextResponse.json(
        { error: 'Type de congé non trouvé' },
        { status: 404 }
      );
    }

    return NextResponse.json(leaveType);
  } catch (error: any) {
    console.error('Erreur lors de la récupération du type de congé:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);

    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'ID invalide' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { name, description, annual_quota, remuneration } = body;

    
    if (!name || annual_quota === undefined || remuneration === undefined) {
      return NextResponse.json(
        { error: 'Le nom, le quota annuel et la rémunération sont requis' },
        { status: 400 }
      );
    }

    if (typeof annual_quota !== 'number' || annual_quota < 0) {
      return NextResponse.json(
        { error: 'Le quota annuel doit être un nombre positif' },
        { status: 400 }
      );
    }

    const existingLeaveType = await prisma.leave_types.findUnique({
      where: { id }
    });

    if (!existingLeaveType) {
      return NextResponse.json(
        { error: 'Type de congé non trouvé' },
        { status: 404 }
      );
    }

    if (name !== existingLeaveType.name) {
      const nameExists = await prisma.leave_types.findUnique({
        where: { name }
      });

      if (nameExists) {
        return NextResponse.json(
          { error: 'Un type de congé avec ce nom existe déjà' },
          { status: 409 }
        );
      }
    }

    const updatedLeaveType = await prisma.leave_types.update({
      where: { id },
      data: {
        name,
        description: description || null,
        annual_quota,
        remuneration
      }
    });

    return NextResponse.json(updatedLeaveType);
  } catch (error: any) {
    console.error('Erreur lors de la mise à jour du type de congé:', error);
    
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Un type de congé avec ce nom existe déjà' },
        { status: 409 }
      );
    }

    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Type de congé non trouvé' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);

    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'ID invalide' },
        { status: 400 }
      );
    }

    const existingLeaveType = await prisma.leave_types.findUnique({
      where: { id }
    });

    if (!existingLeaveType) {
      return NextResponse.json(
        { error: 'Type de congé non trouvé' },
        { status: 404 }
      );
    }

    await prisma.leave_types.delete({
      where: { id }
    });

    return NextResponse.json(
      { message: 'Type de congé supprimé avec succès' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Erreur lors de la suppression du type de congé:', error);
    

    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Type de congé non trouvé' },
        { status: 404 }
      );
    }

  
    if (error.code === 'P2003') {
      return NextResponse.json(
        { error: 'Impossible de supprimer ce type de congé car il est utilisé par des demandes de congé existantes' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
