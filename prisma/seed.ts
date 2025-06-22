import { PrismaClient } from "../generated/prisma"

import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  const email = 'superadmin@example.com'
  const hashedPassword = await bcrypt.hash('SuperSecret123!', 10)

  await prisma.user.upsert({
    where: { email },
    update: {}, // rien à mettre ici si tu ne veux pas modifier
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
      department: 'Administration',
      department_id: 1,
      employment_type: 'CDI',
      salaire_brut: 0,
      status: 'actif',
      gender: 'male',
    },
  })

  console.log('Superadmin upserted!')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
