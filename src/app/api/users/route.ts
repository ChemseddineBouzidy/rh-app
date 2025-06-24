import { NextResponse } from "next/server";
import { PrismaClient } from "../../../../generated/prisma";


const prisma = new PrismaClient();

export const GET = async (req: Request) => {
    try {
        const users = await prisma.user.findMany({
            where: {
                role: {
                    in: ["employe", "manager", "rh"]
                },

            },
            include: {
                department: true,
            },
        });
        return new Response(JSON.stringify(users), { status: 200 });
    } catch (error) {
        console.error("Error fetching users:", error);
        return new Response("Internal Server Error", { status: 500 });
    }
}

export const POST = async (req: Request) => {
    try {
        const {
            first_name,
            last_name,
            gender,
            email,
            password,
            birth_date,
            national_id,
            phone_number,
            address,
            hire_date,
            job_title,
            department,
            department_id,
            employment_type,
            salaire_brut,
            status,
            photo,
            role
        } = await req.json();
        const newUser = await prisma.user.create({
            data: {
                first_name,
                last_name,
                gender,
                email,
                password,
                birth_date,
                national_id,
                phone_number,
                address,
                hire_date,
                job_title,
                department,
                department_id,
                employment_type,
                salaire_brut,
                status,
                photo,
                role
            }
        });
        return NextResponse.json(
            {
                message: 'User créée avec succès.',
                newUser,
            },
            { status: 201 }
        );
    } catch (error :any) {
        console.error("Error creating user:", error);
        return NextResponse.json(
            {
                error: 'Erreur lors de la création user.',
                details: error.message || 'Erreur inconnue',
            },
            { status: 500 }
        );

    }
}

