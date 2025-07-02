import { PrismaClient } from "../../../../generated/prisma";

const prisma = new PrismaClient();

export const GET = async (req: Request) => {
    try {
        const departments = await prisma.department.findMany({
            include: {
                _count: {
                    select: {
                        users: true
                    }
                }
            },
            orderBy: {
                created_at: 'desc'
            }
        });
        return new Response(JSON.stringify(departments), { 
            status: 200
        });
    } catch (error) {
        console.error("Error fetching departments:", error);
        return new Response(JSON.stringify({ error: "Erreur lors de la récupération des départements" }), { 
            status: 500
        });
    }
}

export const POST = async (req: Request) => {
    try {
        const data = await req.json();
        
        if (!data.name || !data.description) {
            return new Response(JSON.stringify({ error: "Nom et description sont requis" }), { 
                status: 400
            });
        }

        const department = await prisma.department.create({
            data: {
                name: data.name.trim(),
                description: data.description.trim(),
            },
            include: {
                _count: {
                    select: {
                        users: true
                    }
                }
            }
        });
        
        return new Response(JSON.stringify(department), { 
            status: 201
        });
    } catch (error) {
        console.error("Error creating department:", error);
        return new Response(JSON.stringify({ error: "Erreur lors de la création du département" }), { 
            status: 500
        });
    }
}

export const PUT = async (req: Request) => {
    try {
        const data = await req.json();
        const { id, name, description } = data;

        if (!id) {
            return new Response(JSON.stringify({ error: "ID du département requis" }), { 
                status: 400
            });
        }

        if (!name || !description) {
            return new Response(JSON.stringify({ error: "Nom et description sont requis" }), { 
                status: 400
            });
        }

        const department = await prisma.department.update({
            where: { id: parseInt(id) },
            data: {
                name: name.trim(),
                description: description.trim(),
            },
            include: {
                _count: {
                    select: {
                        users: true
                    }
                }
            }
        });
        
        return new Response(JSON.stringify(department), { 
            status: 200
        });
    } catch (error) {
        console.error("Error updating department:", error);
        return new Response(JSON.stringify({ error: "Erreur lors de la mise à jour du département" }), { 
            status: 500
        });
    }
}

export const DELETE = async (req: Request) => {
    try {
        const url = new URL(req.url);
        const id = url.searchParams.get('id');

        if (!id) {
            return new Response(JSON.stringify({ error: "ID du département requis" }), { 
                status: 400
            });
        }

       
        const departmentWithUsers = await prisma.department.findUnique({
            where: { id: parseInt(id) },
            include: {
                _count: {
                    select: {
                        users: true
                    }
                }
            }
        });

        if (!departmentWithUsers) {
            return new Response(JSON.stringify({ error: "Département non trouvé" }), { 
                status: 404
            });
        }

        if (departmentWithUsers._count.users > 0) {
            await prisma.user.updateMany({
                where: { department_id: parseInt(id) },
                data: { department_id: null }
            });
        }

      
        await prisma.department.delete({
            where: { id: parseInt(id) },
        });
        
        const message = departmentWithUsers._count.users > 0 
            ? `Département supprimé avec succès. ${departmentWithUsers._count.users} utilisateur${departmentWithUsers._count.users > 1 ? 's ont été' : ' a été'} retiré${departmentWithUsers._count.users > 1 ? 's' : ''} du département.`
            : "Département supprimé avec succès";

        return new Response(JSON.stringify({ message }), { 
            status: 200
        });
    } catch (error) {
        console.error("Error deleting department:", error);
        return new Response(JSON.stringify({ error: "Erreur lors de la suppression du département" }), { 
            status: 500
        });
    }
}