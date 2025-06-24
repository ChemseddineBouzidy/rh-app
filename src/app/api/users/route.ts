import { NextResponse } from "next/server";
import { PrismaClient } from "../../../../generated/prisma";
import bcrypt from "bcrypt";
import path from "path";
import { writeFile, mkdir } from "fs/promises";
import { randomUUID } from "crypto";
import nodemailer from "nodemailer";

const prisma = new PrismaClient();

// Define enums to match Prisma schema
enum EmploymentType {
    CDI = "CDI",
    CDD = "CDD",
    stage = "stage",
    freelance = "freelance"
}

enum Status {
    actif = "actif",
    en_conge = "en_conge",
    suspendu = "suspendu",
    archive = "archive"
}

enum Gender {
    male = "male",
    female = "female",
    other = "other"
}

enum Role {
    employe = "employe",
    manager = "manager",
    rh = "rh",
    admin = "admin"
}

// Function to send welcome email with credentials
async function sendWelcomeEmail(userEmail: string, password: string, firstName: string, lastName: string, creatorEmail: string) {
    try {
        // Create transporter with the creator's email
        const transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST || "smtp.gmail.com",
            port: parseInt(process.env.EMAIL_PORT || "587"),
            secure: process.env.EMAIL_SECURE === "true",
            auth: {
                user: creatorEmail, // Use the creator's email
                pass: process.env.EMAIL_PASS,
            },
        });
        
        await transporter.sendMail({
            from: `"RH App" <${creatorEmail}>`, // Use creator's email as sender
            to: userEmail,
            subject: "Bienvenue sur RH App - Vos identifiants de connexion",
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px;">
                    <h2>Bienvenue ${firstName} ${lastName} sur RH App!</h2>
                    <p>Votre compte a été créé avec succès.</p>
                    <p>Voici vos identifiants de connexion:</p>
                    <ul>
                        <li><strong>Email:</strong> ${userEmail}</li>
                        <li><strong>Mot de passe:</strong> ${password}</li>
                    </ul>
                    <p>Nous vous recommandons de changer votre mot de passe après votre première connexion.</p>
                    <p>Cordialement,<br>L'équipe RH App</p>
                </div>
            `
        });
        console.log(`Welcome email sent to ${userEmail} from ${creatorEmail}`);
    } catch (error) {
        console.error("Error sending welcome email:", error);
    }
}

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
        const formData = await req.formData();

        let photoPath: string | null = null;
        const file = formData.get('photo') as File;
        if (file && file.size > 0) {
            const bytes = await file.arrayBuffer();
            const buffer = Buffer.from(bytes);
            const filename = `${Date.now()}-${randomUUID()}-${file.name}`;
            const uploadDir = path.join(process.cwd(), 'public', 'uploads');

            try {
                await mkdir(uploadDir, { recursive: true });
            } catch (err) {
                console.log("Upload directory already exists or could not be created");
            }

            const filePath = path.join(uploadDir, filename);
            await writeFile(filePath, buffer);
            photoPath = `/uploads/${filename}`;
        }

        const first_name = formData.get('first_name') as string;
        const last_name = formData.get('last_name') as string;
        const genderStr = formData.get('gender') as string;
        const email = formData.get('email') as string;
        const password = formData.get('password') as string;
        const birth_date = formData.get('birth_date') as string;
        const national_id = formData.get('national_id') as string;
        const phone_number = formData.get('phone_number') as string;
        const address = formData.get('address') as string;
        const hire_date = formData.get('hire_date') as string;
        const job_title = formData.get('job_title') as string;
        const department_id = parseInt(formData.get('department_id') as string);
        const employmentTypeStr = formData.get('employment_type') as string;
        const statusStr = formData.get('status') as string;
        const roleStr = formData.get('role') as string;

        if (!Object.values(EmploymentType).includes(employmentTypeStr as any)) {
            return NextResponse.json(
                { error: 'Type de contrat invalide' },
                { status: 400 }
            );
        }

        if (!Object.values(Status).includes(statusStr as any)) {
            return NextResponse.json(
                { error: 'Statut invalide' },
                { status: 400 }
            );
        }

        if (!Object.values(Gender).includes(genderStr as any)) {
            return NextResponse.json(
                { error: 'Genre invalide' },
                { status: 400 }
            );
        }

        if (!Object.values(Role).includes(roleStr as any)) {
            return NextResponse.json(
                { error: 'Rôle invalide' },
                { status: 400 }
            );
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await prisma.user.create({
            data: {
                first_name,
                last_name,
                gender: genderStr as Gender,
                email,
                password: hashedPassword,
                birth_date,
                national_id,
                phone_number,
                address,
                hire_date,
                job_title,
                department_id,
                employment_type: employmentTypeStr as EmploymentType,
                salaire_brut: parseFloat(formData.get('salaire_brut') as string),
                status: statusStr as Status,
                photo: photoPath,
                role: roleStr as Role
            }
        });

        // Get creator's email from form data
        const creatorEmail = formData.get('creator_email') as string;
        
        if (!creatorEmail) {
            console.warn("Creator email not provided, using default email configuration");
        }

        // Send welcome email with login credentials
        await sendWelcomeEmail(
            email, 
            password, 
            first_name, 
            last_name,
            creatorEmail || (process.env.EMAIL_USER as string)
        );

        return NextResponse.json(
            {
                message: 'User créée avec succès.',
                newUser,
            },
            { status: 201 }
        );
    } catch (error: any) {
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


