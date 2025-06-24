import { PrismaClient } from "../../../../generated/prisma";

const prisma = new PrismaClient();

export const GET = async (req: Request) => {
    try {
        const departments = await prisma.department.findMany();
        return new Response(JSON.stringify(departments), { status: 200 });
    } catch (error) {
        console.error("Error fetching departments:", error);
        return new Response("Internal Server Error", { status: 500 });
    }
}

export const POST = async (req: Request) => {
    try {
        const data = await req.json();
        const department = await prisma.department.create({
            data: {
                name: data.name,
                description: data.description,
            },
        });
        return new Response(JSON.stringify(department), { status: 201 });
    } catch (error) {
        console.error("Error creating department:", error);
        return new Response(JSON.stringify({ error: "Erreur lors de la création du département", details: error }), { status: 500 });
    }
}