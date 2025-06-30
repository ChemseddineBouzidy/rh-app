import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from "../../../../generated/prisma";

const prisma = new PrismaClient();

// GET - Récupérer tous les types de congé
export async function GET() {
  try {
    const leaveTypes = await prisma.leave_types.findMany({
      orderBy: {
        name: 'asc'
      }
    });

    return NextResponse.json(leaveTypes);
  } catch (error) {
    console.error('Erreur lors de la récupération des types de congé:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

// POST - Créer un nouveau type de congé
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, annual_quota, remuneration } = body;

    // Validation des données requises
    if (!name || annual_quota === undefined || remuneration === undefined) {
      return NextResponse.json(
        { error: 'Le nom, le quota annuel et la rémunération sont requis' },
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

    // Vérifier si le nom existe déjà
    const existingLeaveType = await prisma.leave_types.findUnique({
      where: { name }
    });

    if (existingLeaveType) {
      return NextResponse.json(
        { error: 'Un type de congé avec ce nom existe déjà' },
        { status: 409 }
      );
    }

    // Créer le nouveau type de congé
    const newLeaveType = await prisma.leave_types.create({
      data: {
        name,
        description: description || null,
        annual_quota,
        remuneration
      }
    });

    return NextResponse.json(newLeaveType, { status: 201 });
  } catch (error: any) {
    console.error('Erreur lors de la création du type de congé:', error);
    
    // Gestion des erreurs Prisma
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Un type de congé avec ce nom existe déjà' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
