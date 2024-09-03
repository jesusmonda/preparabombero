import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const alice = await prisma.user.upsert({
    where: { email: 'demo@preparabombero.com' },
    update: {},
    create: {
      email: 'demo@preparabombero.com',
      name: 'Demo',
      surname: 'Demo',
      password: 'demo',
      role: 'USER'
    },
  })
  const bob = await prisma.user.upsert({
    where: { email: 'admin@preparabombero.com' },
    update: {},
    create: {
      email: 'admin@preparabombero.com',
      name: 'Admin',
      surname: 'Admin',
      password: process.env.ADMIN_PASSSWORD,
      role: 'ADMIN'
    },
  })
  console.log({ alice, bob })
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