import { PrismaClient } from "../generated/prisma/index.js"; // ✅
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  const email = 'superadmin@example.com'
  const hashedPassword = await bcrypt.hash('SuperSecret123!', 10)

  // Vérifie ou crée le département
  const department = await prisma.department.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      name: 'Direction',
      description: 'Département principal',
    },
  })

  // Crée ou met à jour le superadmin
  await prisma.user.upsert({
    where: { email },
    update: {}, // ne rien modifier s'il existe
    create: {
      first_name: 'Super',
      last_name: 'Admin',
      email,
      password: hashedPassword,
      role: 'admin',
      birth_date: new Date('1980-01-01'),
      national_id: '0000000000',
      phone_number: '0000000000',
      address: 'Admin Street',
      hire_date: new Date(),
      job_title: 'Super Admin',
      department_id: department.id,
      employment_type: 'CDI',
      salaire_brut: 0,
      status: 'actif',
      gender: 'male',
    },
  })

  console.log('✅ Superadmin seeded.')
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error('❌ Error:', e)
    await prisma.$disconnect()
    process.exit(1)
  })
