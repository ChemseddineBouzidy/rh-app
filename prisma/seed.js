import { PrismaClient } from "../generated/prisma/index.js"; 
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

  // Seed leave types
  const leaveTypes = [
    { id: 1, name: 'Congé annuel payé', description: 'Congé annuel standard', annual_quota: 18, remuneration: true },
    { id: 2, name: 'Congé maladie', description: 'Congé pour maladie', annual_quota: 180, remuneration: true },
    { id: 3, name: 'Congé maternité', description: 'Congé de maternité', annual_quota: 98, remuneration: true },
    { id: 4, name: 'Congé paternité', description: 'Congé de paternité', annual_quota: 3, remuneration: true },
    { id: 5, name: 'Mariage salarié', description: 'Congé pour mariage du salarié', annual_quota: 4, remuneration: true },
    { id: 6, name: 'Mariage enfant', description: 'Congé pour mariage d\'un enfant', annual_quota: 2, remuneration: true },
    { id: 7, name: 'Décès (parent proche)', description: 'Congé de deuil pour parent proche', annual_quota: 3, remuneration: true },
    { id: 8, name: 'Circoncision d\'un enfant', description: 'Congé pour circoncision d\'un enfant', annual_quota: 2, remuneration: true },
    // { id: 9, name: 'Congé pour examen', description: 'Congé pour passer un examen', annual_quota: 0, remuneration: false },
    // { id: 10, name: 'Congé sans solde', description: 'Congé non rémunéré', annual_quota: 0, remuneration: false },
    // { id: 11, name: 'Congé sabbatique', description: 'Congé sabbatique de longue durée', annual_quota: 365, remuneration: false },
  ]

  for (const leaveType of leaveTypes) {
    await prisma.leave_types.upsert({
      where: { id: leaveType.id },
      update: {},
      create: leaveType,
    })
  }

  console.log('✅ Leave types seeded.')
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error('❌ Error:', e)
    await prisma.$disconnect()
    process.exit(1)
  })
