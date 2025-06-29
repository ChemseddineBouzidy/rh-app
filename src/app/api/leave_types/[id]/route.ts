import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from "../../../../../generated/prisma";

const prisma = new PrismaClient();

// GET - Récupérer un type de congé par ID
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

// PUT - Mettre à jour un type de congé
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
    const { name, description, annual_quota } = body;

    // Validation des données requises
    if (!name || annual_quota === undefined) {
      return NextResponse.json(
        { error: 'Le nom et le quota annuel sont requis' },
        { status: 400 }
      );
    }

    // Validation du quota annuel
    if (typeof annual_quota !== 'number' || annual_quota < 0) {
      return NextResponse.json(
        { error: 'Le quota annuel doit être un nombre positif' },
        { status: 400 }
      );
    }

    // Vérifier si le type de congé existe
    const existingLeaveType = await prisma.leave_types.findUnique({
      where: { id }
    });

    if (!existingLeaveType) {
      return NextResponse.json(
        { error: 'Type de congé non trouvé' },
        { status: 404 }
      );
    }

    // Vérifier si le nouveau nom existe déjà (sauf pour ce type de congé)
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

    // Mettre à jour le type de congé
    const updatedLeaveType = await prisma.leave_types.update({
      where: { id },
      data: {
        name,
        description: description || null,
        annual_quota
      }
    });

    return NextResponse.json(updatedLeaveType);
  } catch (error: any) {
    console.error('Erreur lors de la mise à jour du type de congé:', error);
    
    // Gestion des erreurs Prisma
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

// DELETE - Supprimer un type de congé
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

    // Vérifier si le type de congé existe
    const existingLeaveType = await prisma.leave_types.findUnique({
      where: { id }
    });

    if (!existingLeaveType) {
      return NextResponse.json(
        { error: 'Type de congé non trouvé' },
        { status: 404 }
      );
    }

    // TODO: Vérifier s'il y a des congés associés à ce type
    // Vous pourriez vouloir empêcher la suppression si des congés utilisent ce type
    // ou les supprimer/transférer en cascade selon vos besoins métier

    // Supprimer le type de congé
    await prisma.leave_types.delete({
      where: { id }
    });

    return NextResponse.json(
      { message: 'Type de congé supprimé avec succès' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Erreur lors de la suppression du type de congé:', error);
    
    // Gestion des erreurs Prisma
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Type de congé non trouvé' },
        { status: 404 }
      );
    }

    // Erreur de contrainte de clé étrangère
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
