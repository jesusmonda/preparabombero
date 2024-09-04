import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const demo = await prisma.user.upsert({
    where: { email: 'demo@preparabombero.com' },
    update: {
      password: '$2a$10$CQh29OfW25Yg34TIFf2.4ODvVody8RUp3drm7bHFqc1Kms0u7flBG',
    },
    create: {
      email: 'demo@preparabombero.com',
      name: 'Demo',
      surname: 'Demo',
      password: '$2a$10$CQh29OfW25Yg34TIFf2.4ODvVody8RUp3drm7bHFqc1Kms0u7flBG',
      role: 'USER'
    },
  })
  console.log(process.env.ADMIN_PASSSWORD)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@preparabombero.com' },
    update: {
      password: `$2a$10$uVgbmPWCA9CCLIZFPVUmnemyprezy491lu3zovByJZuOti0Ng35QK`,
    },
    create: {
      email: 'admin@preparabombero.com',
      name: 'Admin',
      surname: 'Admin',
      password: `$2a$10$uVgbmPWCA9CCLIZFPVUmnemyprezy491lu3zovByJZuOti0Ng35QK`,
      role: 'ADMIN'
    },
  })
  console.log({ demo, admin })
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