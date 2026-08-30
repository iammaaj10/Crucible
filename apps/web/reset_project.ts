import { PrismaClient, Prisma } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  await prisma.project.updateMany({
    data: {
      designGraph: { nodes: [], edges: [] },
      simResults: Prisma.DbNull
    }
  })
  console.log("Projects reset")
}
main()
