import { NextResponse } from "next/server";
import { PrismaClient } from "../../../../generated/prisma";
import bcrypt from "bcrypt";
import path from "path";
import { writeFile, mkdir } from "fs/promises";
import { randomUUID } from "crypto";
import nodemailer from "nodemailer";

const prisma = new PrismaClient();

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
            html: `<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <!--[if mso]>
    <noscript>
        <xml>
            <o:OfficeDocumentSettings>
                <o:PixelsPerInch>96</o:PixelsPerInch>
            </o:OfficeDocumentSettings>
        </xml>
    </noscript>
    <![endif]-->
    <title>Bienvenue - RH App Platform</title>
   <style type="text/css">
    /* Reset for Outlook */
    #outlook a { padding: 0; }
    .ReadMsgBody, .ExternalClass { width: 100%; }
    .ExternalClass, .ExternalClass * { line-height: 100%; }

    /* Base styles */
    body, table, td, p, a, li, blockquote {
        -webkit-text-size-adjust: 100%;
        -ms-text-size-adjust: 100%;
        font-family: Arial, sans-serif;
    }

    body {
        margin: 0 !important;
        padding: 0 !important;
        background-color: #f3f4f6 !important;
        width: 100% !important;
    }

    table {
        border-collapse: collapse !important;
        mso-table-lspace: 0pt;
        mso-table-rspace: 0pt;
    }

    img {
        -ms-interpolation-mode: bicubic;
        border: 0;
        height: auto;
        display: block;
        outline: none;
        text-decoration: none;
    }

    .button-td {
        border-radius: 8px;
        background-color: #2563eb;
    }

    .button-a {
        background-color: #2563eb;
        border: 1px solid #2563eb;
        border-radius: 8px;
        color: #ffffff;
        display: inline-block;
        font-size: 16px;
        font-weight: 600;
        padding: 14px 32px;
        text-align: center;
        text-decoration: none;
        -webkit-text-size-adjust: none;
    }

    .button-a:hover {
        background-color: #1d4ed8;
        border-color: #1d4ed8;
    }

    .hide-outlook { display: none; mso-hide: all; }

    /* Mobile Styles */
    @media screen and (max-width: 600px) {
        .container {
            width: 100% !important;
            max-width: 100% !important;
        }
        .mobile-padding {
            padding: 24px 16px !important;
        }
        .header-padding {
            padding: 20px 16px !important;
        }
        .password-box {
            font-size: 18px !important;
            padding: 12px !important;
            letter-spacing: 1px;
        }
        .mobile-text {
            font-size: 14px !important;
        }
        .button-a {
            font-size: 14px !important;
            padding: 12px 24px !important;
        }
    }

    /* Outlook-specific */
    .mso-no-spacing {
        mso-line-height-rule: exactly;
    }

    /* Outlook 2007+ */
    @media only screen and (min-width:0) {
        .fallback-text {
            font-family: Arial, sans-serif !important;
        }

        .button-fallback {
            display: block !important;
            width: auto !important;
            border-radius: 8px !important;
            background-color: #2563eb !important;
            color: #ffffff !important;
        }

        .info-table {
            width: 100% !important;
        }
    }
</style>

    
    <!--[if gte mso 9]>
    <style type="text/css">
        /* Styles spécifiques pour Outlook 2007+ */
        .fallback-text {
            font-family: Arial, sans-serif !important;
        }
        
        .button-fallback {
            display: block !important;
            width: auto !important;
            border: none !important;
            border-radius: 6px !important;
            background-color: #1448E7 !important;
        }
        
        .info-table {
            width: 100% !important;
        }
    </style>
    <![endif]-->
</head>

<body style="margin:0; padding:0; background-color:#f8fafc; width:100%;">
    
    <!-- Conteneur principal avec support Outlook -->
    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f8fafc; min-width: 100%;">
        <tr>
            <td align="center" valign="top" style="padding: 40px 20px;">
                
                <!-- Container principal -->
                <table border="0" cellpadding="0" cellspacing="0" width="600" class="container" style="background-color: #ffffff; max-width: 600px; border: 1px solid #e5e7eb;">
                    <!--[if mso]>
                    <table border="0" cellpadding="0" cellspacing="0" width="600">
                    <tr>
                    <td>
                    <![endif]-->
                    
                    <!-- Header avec logo -->
                    <tr>
                        <td align="center" valign="middle" class="header-padding" style="padding: 32px 40px; background-color: #1448E7;">
                            <!--[if mso]>
                            <table border="0" cellpadding="0" cellspacing="0" width="100%">
                            <tr>
                            <td align="center">
                            <![endif-->
                            
                            <h1 style="color: #ffffff; margin: 0; font-size: 26px; font-weight: bold;">RH App</h1>
                            
                            <!--[if mso]>
                            </td>
                            </tr>
                            </table>
                            <![endif]-->
                        </td>
                    </tr>
                    
                    <!-- Contenu principal -->
                    <tr>
                        <td align="left" valign="top" class="mobile-padding" style="padding: 40px;">
                            
                            <!-- Titre -->
                            <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                <tr>
                                    <td style="padding-bottom: 24px;">
                                        <h1 class="fallback-text" style="color: #1f2937; font-size: 22px; font-weight: bold; margin: 0; line-height: 1.3; font-family: Arial, Helvetica, sans-serif;">
                                            Bienvenue sur la plateforme RH App
                                        </h1>
                                    </td>
                                </tr>
                            </table>
                            
                            <!-- Salutation -->
                            <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                <tr>
                                    <td style="padding-bottom: 16px;">
                                        <p class="fallback-text" style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0; font-family: Arial, Helvetica, sans-serif;">
                                            Bonjour ${firstName} ${lastName},
                                        </p>
                                    </td>
                                </tr>
                            </table>
                            
                            <!-- Message principal -->
                            <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                <tr>
                                    <td style="padding-bottom: 32px;">
                                        <p class="fallback-text mobile-text" style="color: #4b5563; font-size: 15px; line-height: 1.6; margin: 0; font-family: Arial, Helvetica, sans-serif;">
                                            Votre compte a été créé avec succès sur la <strong>plateforme RH App</strong>. Voici vos informations de connexion :
                                        </p>
                                    </td>
                                </tr>
                            </table>
                            
                            <!-- Informations de connexion -->
                            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 0 0 24px 0;">
                                <tr>
                                    <td style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 24px;">
                                        <!--[if mso]>
                                        <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                        <![endif]-->
                                        
                                        <table border="0" cellpadding="0" cellspacing="0" width="100%" class="info-table" style="font-size: 14px;">
                                            <tr>
                                                <td style="padding: 6px 0; color: #6b7280; font-weight: bold; width: 120px; font-family: Arial, Helvetica, sans-serif;">
                                                    Email :
                                                </td>
                                                <td style="padding: 6px 0; color: #1f2937; font-weight: bold; font-family: Arial, Helvetica, sans-serif;">
                                                    ${userEmail}
                                                </td>
                                            </tr>
                                        </table>
                                        
                                        <!--[if mso]>
                                        </table>
                                        <![endif]-->
                                    </td>
                                </tr>
                            </table>
                            
                            <!-- Mot de passe temporaire -->
                            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 32px 0;">
                                <tr>
                                    <td align="center">
                                        <!--[if mso]>
                                        <table border="0" cellpadding="0" cellspacing="0">
                                        <tr>
                                        <td align="center" style="background-color: #fef9f9; border: 2px solid #1448E7; padding: 20px;">
                                        <![endif]-->
                                        
                                        <table border="0" cellpadding="0" cellspacing="0" style="background-color: #fef9f9; border: 2px solid #1448E7;">
                                            <tr>
                                                <td align="center" style="padding: 20px;">
                                                    <!-- Label -->
                                                    <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                                        <tr>
                                                            <td align="center" style="padding-bottom: 8px;">
                                                                <p class="fallback-text" style="color: #6b7280; font-size: 12px; font-weight: bold; margin: 0; text-transform: uppercase; letter-spacing: 1px; font-family: Arial, Helvetica, sans-serif;">
                                                                    Mot de passe temporaire
                                                                </p>
                                                            </td>
                                                        </tr>
                                                    </table>
                                                    
                                                    <!-- Mot de passe -->
                                                    <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                                        <tr>
                                                            <td align="center" style="padding: 8px 0;">
                                                                <div style="font-family: 'Courier New', Courier, monospace; font-size: 20px; font-weight: bold; color: #1448E7; letter-spacing: 2px; text-align: center; margin: 0; word-break: break-all; line-height: 1.2;" class="password-box fallback-text">
                                                                    ${password}
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    </table>
                                                    
                                                    <!-- Note -->
                                                    <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                                        <tr>
                                                            <td align="center" style="padding-top: 8px;">
                                                                <p class="fallback-text" style="margin: 0; color: #1448E7; font-size: 12px; font-weight: bold; text-align: center; font-family: Arial, Helvetica, sans-serif;">
                                                                    À changer lors de votre première connexion
                                                                </p>
                                                            </td>
                                                        </tr>
                                                    </table>
                                                </td>
                                            </tr>
                                        </table>
                                        
                                        <!--[if mso]>
                                        </td>
                                        </tr>
                                        </table>
                                        <![endif]-->
                                    </td>
                                </tr>
                            </table>
                            
                            <!-- Bouton de connexion - Compatible Outlook -->
                            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 32px 0;">
                                <tr>
                                    <td align="center">
                                        <!--[if mso]>
                                        <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/login" style="height:48px; v-text-anchor:middle; width:220px;" arcsize="13%" strokecolor="#1448E7" fillcolor="#1448E7">
                                        <w:anchorlock/>
                                        <center style="color:#ffffff; font-family:Arial, sans-serif; font-size:16px; font-weight:bold;">Se connecter maintenant</center>
                                        </v:roundrect>
                                        <![endif]-->
                                        
                                        <!--[if !mso]><!-->
                                        <table border="0" cellpadding="0" cellspacing="0">
                                            <tr>
                                                <td align="center" class="button-td" style="border-radius: 6px; background-color: #1448E7;">
                                                    <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/login" class="button-a" style="background-color: #1448E7; border: 1px solid #1448E7; border-radius: 6px; color: #ffffff; display: inline-block; font-family: Arial, Helvetica, sans-serif; font-size: 16px; font-weight: bold; line-height: 1.2; padding: 14px 32px; text-align: center; text-decoration: none; -webkit-text-size-adjust: none;">
                                                        Se connecter maintenant
                                                    </a>
                                                </td>
                                            </tr>
                                        </table>
                                        <!--<![endif]-->
                                    </td>
                                </tr>
                            </table>
                            
                            <!-- Instructions de première connexion -->
                            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 24px 0;">
                                <tr>
                                    <td style="background-color: #fef9f9; border-left: 3px solid #1448E7; padding: 16px;">
                                        <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                            <tr>
                                                <td style="padding-bottom: 8px;">
                                                    <p class="fallback-text" style="color: #b91c1c; font-size: 14px; font-weight: bold; margin: 0; font-family: Arial, Helvetica, sans-serif;">
                                                        Première connexion :
                                                    </p>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td>
                                                    <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                                        <tr>
                                                            <td style="color: #1448E7; font-size: 13px; line-height: 1.5; font-family: Arial, Helvetica, sans-serif;">
                                                                • Changez votre mot de passe temporaire<br>
                                                                • Vérifiez vos informations de profil<br>
                                                                • Gardez vos identifiants confidentiels
                                                            </td>
                                                        </tr>
                                                    </table>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>
                            
                            <!-- Signature -->
                            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="border-top: 1px solid #e5e7eb; padding-top: 24px; margin-top: 40px;">
                                <tr>
                                    <td>
                                        <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                            <tr>
                                                <td style="padding-bottom: 8px;">
                                                    <p class="fallback-text" style="color: #4b5563; font-size: 14px; margin: 0; font-family: Arial, Helvetica, sans-serif;">
                                                        Cordialement,
                                                    </p>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="padding-bottom: 4px;">
                                                    <p class="fallback-text" style="color: #1448E7; font-size: 15px; font-weight: bold; margin: 0; font-family: Arial, Helvetica, sans-serif;">
                                                        L'équipe RH App
                                                    </p>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td align="center" style="background-color: #f9fafb; padding: 20px; border-top: 1px solid #e5e7eb;">
                            <p class="fallback-text" style="margin: 0; font-size: 12px; color: #6b7280; text-align: center; font-family: Arial, Helvetica, sans-serif;">
                                &copy; ${new Date().getFullYear()} RH App
                            </p>
                        </td>
                    </tr>
                    
                    <!--[if mso]>
                    </td>
                    </tr>
                    </table>
                    <![endif]-->
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`
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


