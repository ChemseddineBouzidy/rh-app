import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// Add this to prevent static optimization of this route
export const dynamic = 'force-dynamic';

export const GET = async (req: Request, { params }: { params: { id: string } }) => {
    try {
        const { id } = params;

        const user = await prisma.user.findUnique({
            where: { id },
            include: {
                department: true,
            }
        });

        if (!user) {
            return NextResponse.json(
                { error: 'Utilisateur non trouvé' },
                { status: 404 }
            );
        }

        return NextResponse.json(user, { status: 200 });
    } catch (error) {
        console.error("Error fetching user:", error);
        return NextResponse.json(
            { error: 'Erreur lors de la récupération de l\'utilisateur' },
            { status: 500 }
        );
    }
};

export const PUT = async (req: Request, { params }: { params: { id: string } }) => {
    try {
        const { id } = params;
        const data = await req.json();

        const updateData: any = { ...data };
       
        if (updateData.birth_date) {
            updateData.birth_date = new Date(updateData.birth_date);
        }
        if (updateData.hire_date) {
            updateData.hire_date = new Date(updateData.hire_date);
        }

  
        if (updateData.department_id === null || updateData.department_id === '') {
            updateData.department_id = null;
        }

        const updatedUser = await prisma.user.update({
            where: { id },
            data: updateData,
            include: {
                department: true,
            }
        });

        return NextResponse.json(
            {
                message: 'Utilisateur mis à jour avec succès',
                user: updatedUser,
            },
            { status: 200 }
        );
    } catch (error: any) {
        console.error("Error updating user:", error);
        
        if (error.code === 'P2025') {
            return NextResponse.json(
                { error: 'Utilisateur non trouvé' },
                { status: 404 }
            );
        }

        return NextResponse.json(
            {
                error: 'Erreur lors de la mise à jour de l\'utilisateur',
                details: error.message,
            },
            { status: 500 }
        );
    }
};

export const DELETE = async (req: Request, { params }: { params: { id: string } }) => {
    try {
        const { id } = params;

       
        const existingUser = await prisma.user.findUnique({
            where: { id },
            select: { 
                id: true, 
                first_name: true, 
                last_name: true, 
                role: true 
            }
        });

        if (!existingUser) {
            return NextResponse.json(
                { error: 'Utilisateur non trouvé' },
                { status: 404 }
            );
        }

        // Prevent deletion of admin users
        if (existingUser.role === 'admin') {
            return NextResponse.json(
                { error: 'Impossible de supprimer un utilisateur administrateur' },
                { status: 403 }
            );
        }

        // Soft delete by archiving
        await prisma.user.update({
            where: { id },
            data: { 
                status: 'archive',
                deleted_at: new Date()
            }
        });

        return NextResponse.json(
            { 
                message: `Utilisateur ${existingUser.first_name} ${existingUser.last_name} supprimé avec succès`
            },
            { status: 200 }
        );
    } catch (error: any) {
        console.error("Error deleting user:", error);

        return NextResponse.json(
            {
                error: 'Erreur lors de la suppression de l\'utilisateur',
                details: error.message,
            },
            { status: 500 }
        );
    }
};
