import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '../../../../../generated/prisma/client';
import nodemailer from 'nodemailer';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// Function to generate a secure password
function generatePassword(length = 10) {
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  const symbols = '!@#$%&*';
  
  const allChars = lowercase + uppercase + numbers + symbols;
  let password = '';
  
  // Ensure at least one character from each category
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += symbols[Math.floor(Math.random() * symbols.length)];
  
  // Fill the rest randomly
  for (let i = password.length; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }
  
  // Shuffle the password
  return password.split('').sort(() => Math.random() - 0.5).join('');
}

async function sendPasswordResetEmail(userEmail: string, newPassword: string, firstName: string, lastName: string) {
  try {
    // Create transporter - use EMAIL_* variables to match your .env
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Test the connection
    await transporter.verify();

    await transporter.sendMail({
      from: process.env.EMAIL_FROM || `"Bayllo RH" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: '🔐 Votre nouveau mot de passe - Bayllo',
      html: `<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Nouveau mot de passe - Bayllo</title>
    <style type="text/css">
        body { margin: 0; padding: 0; background-color: #f8fafc; font-family: Arial, sans-serif; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
        .header { background: linear-gradient(135deg, #3b82f6, #1d4ed8); color: white; padding: 30px; text-align: center; }
        .content { padding: 30px; }
        .logo { font-size: 24px; font-weight: bold; }
        .password-box { 
            background: #1f2937; 
            color: #f9fafb; 
            padding: 20px; 
            border-radius: 8px; 
            text-align: center; 
            margin: 20px 0; 
            font-family: 'Courier New', monospace; 
            font-size: 18px; 
            font-weight: bold; 
            letter-spacing: 2px; 
        }
        .warning { 
            background: #fef3cd; 
            border: 1px solid #fbbf24; 
            color: #92400e; 
            padding: 15px; 
            border-radius: 5px; 
            margin: 20px 0; 
        }
        .footer { 
            text-align: center; 
            margin-top: 30px; 
            color: #6b7280; 
            font-size: 14px; 
            background-color: #f9fafb; 
            padding: 20px; 
            border-top: 1px solid #e5e7eb; 
        }
        @media screen and (max-width: 600px) {
            .container { width: 100% !important; }
            .content { padding: 20px !important; }
            .password-box { font-size: 16px !important; letter-spacing: 1px !important; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">
                <span style="color: #60a5fa;">■</span>
                BAYLLO
            </div>
            <h2>Nouveau mot de passe</h2>
        </div>
        <div class="content">
            <h3>Bonjour ${firstName} ${lastName},</h3>
            <p>Votre demande de réinitialisation de mot de passe a été traitée. Voici votre nouveau mot de passe :</p>
            
            <div class="password-box">
                ${newPassword}
            </div>
            
            <div class="warning">
                <strong>⚠️ Important :</strong>
                <ul style="margin: 10px 0; padding-left: 20px;">
                    <li>Connectez-vous immédiatement avec ce mot de passe</li>
                    <li>Changez ce mot de passe dès votre première connexion</li>
                    <li>Ne partagez jamais ce mot de passe avec qui que ce soit</li>
                    <li>Supprimez cet email après avoir noté le mot de passe</li>
                </ul>
            </div>
            
            <p>Pour vous connecter :</p>
            <ol style="padding-left: 20px;">
                <li>Rendez-vous sur <a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/auth/signin" style="color: #3b82f6;">la page de connexion</a></li>
                <li>Utilisez votre email : <strong>${userEmail}</strong></li>
                <li>Saisissez le mot de passe ci-dessus</li>
                <li>Changez immédiatement votre mot de passe dans votre profil</li>
            </ol>
            
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
            <p style="font-size: 14px; color: #6b7280;">
                Si vous n'avez pas demandé cette réinitialisation, contactez immédiatement l'administrateur système.
            </p>
        </div>
        <div class="footer">
            <p>© ${new Date().getFullYear()} Bayllo - Application RH tout-en-un</p>
            <p>Cet email contient des informations confidentielles. Supprimez-le après utilisation.</p>
        </div>
    </div>
</body>
</html>`
    });
    
    console.log(`Password reset email sent to ${userEmail}`);
  } catch (error) {
    console.error("Error sending password reset email:", error);
    throw error;
  }
}

// POST is correct for password reset because:
// 1. It's a non-idempotent operation (creates new password each time)
// 2. It modifies server state (updates user password in database)
// 3. It sends sensitive data (email) that shouldn't be in URL
// 4. It triggers side effects (sends email)

export async function POST(req: NextRequest) {
  try {
    console.log('Reset password API called');
    
    // Validate environment variables - use EMAIL_* variables
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.error('Missing EMAIL credentials. EMAIL_USER:', !!process.env.EMAIL_USER, 'EMAIL_PASS:', !!process.env.EMAIL_PASS);
      return NextResponse.json(
        { error: 'Configuration email manquante' },
        { status: 500 }
      );
    }

    const { email } = await req.json();
    console.log('Reset password requested for:', email);

    if (!email) {
      return NextResponse.json(
        { error: 'Email est requis' },
        { status: 400 }
      );
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: {
        id: true,
        email: true,
        first_name: true,
        last_name: true,
      },
    });

    if (!user) {
      console.log('User not found for email:', email);
      // For security, don't reveal if email exists or not
      return NextResponse.json({
        message: 'Si cet email existe, un nouveau mot de passe a été envoyé',
      });
    }

    console.log('User found, generating new password');

    // Generate new password
    const newPassword = generatePassword(10);
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update user password in database
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
      },
    });

    console.log('Password updated in database, sending email');

    // Send password reset email
    await sendPasswordResetEmail(
      user.email,
      newPassword,
      user.first_name,
      user.last_name
    );

    return NextResponse.json({
      message: 'Si cet email existe, un nouveau mot de passe a été envoyé',
    });

  } catch (error) {
    console.error('Password reset error:', error);
    
    // More detailed error logging
    if (error instanceof Error) {
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }

    return NextResponse.json(
      { 
        error: 'Erreur lors de l\'envoi du nouveau mot de passe',
        details: process.env.NODE_ENV === 'development' ? error?.message : undefined
      },
      { status: 500 }
    );
  }
}

// PUT would be inappropriate because:
// - PUT is for updating with a known new value
// - PUT should be idempotent (same result each time)
// - In password reset, we generate a NEW random password each time
// - The client doesn't provide the new password value

// If you wanted to allow users to SET their own new password,
// then you might use PUT like this:
/*
export async function PUT(req: NextRequest) {
  const { email, newPassword, token } = await req.json();
  // Verify token and update to the provided password
}
*/
