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