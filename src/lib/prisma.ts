import { PrismaClient } from '@prisma/client'

const client = new PrismaClient({
  log: ['error']
})

export { client }
